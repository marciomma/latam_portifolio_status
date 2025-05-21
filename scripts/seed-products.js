require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

// Dados de exemplo para inicializar o banco
const sampleProducts = [
  {
    id: "product-example-1",
    name: "ACP Exemplo",
    procedureId: "proc-1",
    productTypeId: "type-4",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true
  },
  {
    id: "product-example-2",
    name: "Novo Produto Exemplo",
    procedureId: "proc-1",
    productTypeId: "type-4",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    isActive: true
  }
];

// Função para inicializar o cliente Redis
const getRedisClient = () => {
  // Usar valores fixos
  const url = "https://united-mammal-20071.upstash.io";
  const token = "AU5nAAIjcDFmM2ZiZjU3NjMxZDQ0YWY1OTIyMmZlMzgxMDgzMTkzYXAxMA";
  
  console.log('Conectando ao Redis usando URL fixa:', url);
  return new Redis({ url, token });
};

async function seedProducts() {
  console.log('Iniciando seed de produtos...');
  
  const redis = getRedisClient();
  if (!redis) {
    console.error('Não foi possível inicializar o cliente Redis.');
    process.exit(1);
  }

  try {
    // Verificar conexão
    console.log('Testando conexão com o Redis...');
    const pingResult = await redis.ping();
    console.log('Resposta do Redis ping:', pingResult);

    // Deletar a chave de produtos
    console.log('Excluindo chave de produtos...');
    await redis.del('products');
    console.log('Chave de produtos excluída com sucesso.');

    // Salvar produtos de exemplo - usando formato estrito de string JSON
    const productsJson = JSON.stringify(sampleProducts);
    console.log(`Salvando ${sampleProducts.length} produtos de exemplo...`);
    console.log('Dados a serem salvos:', productsJson);
    
    // Salvar usando set direto
    const result = await redis.set('products', productsJson);
    console.log(`Resultado do salvamento: ${result}`);

    // Verificação imediata
    console.log('Verificando se os dados foram salvos corretamente...');
    const verification = await redis.get('products');
    console.log('Tipo de dado retornado:', typeof verification);
    
    // Tentativa de parsing dos dados
    if (typeof verification === 'string') {
      try {
        const parsedData = JSON.parse(verification);
        console.log('Parsing bem-sucedido. Número de produtos:', parsedData.length);
        console.log('Primeiro produto:', parsedData[0]);
      } catch (e) {
        console.error('Erro ao fazer parsing dos dados:', e);
      }
    } else if (Array.isArray(verification)) {
      console.log('Redis retornou array diretamente. Número de produtos:', verification.length);
      console.log('Primeiro produto:', verification[0]);
    } else {
      console.error('Tipo de dados inesperado:', typeof verification);
    }

    console.log('Seed de produtos concluído com sucesso.');
    
    // Verificar com getData simulando o comportamento da aplicação
    console.log('\nVerificando acesso via método getFromRedis simulado:');
    const appData = await simulateGetFromRedis('products');
    console.log(`Dados recuperados pela app: ${appData.length} produtos`);
    
    if (appData.length > 0) {
      console.log('Nomes dos produtos:');
      appData.forEach(product => console.log(`- ${product.name}`));
    }
  } catch (error) {
    console.error('Erro durante seed de produtos:', error);
  }
  
  process.exit(0);
}

// Simula o comportamento da função getFromRedis no app
async function simulateGetFromRedis(key) {
  const redis = getRedisClient();
  const data = await redis.get(key);

  if (!data) {
    console.log(`simulateGetFromRedis: Chave ${key} não existe, retornando array vazio`);
    return [];
  }

  // Se já for um array, retornar diretamente
  if (Array.isArray(data)) {
    console.log(`simulateGetFromRedis: ${key} é um array com ${data.length} itens`);
    return data;
  }

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`simulateGetFromRedis: ${key} é uma string JSON que contém um array com ${parsed.length} itens`);
        return parsed;
      } else {
        console.error(`simulateGetFromRedis: ${key} é uma string JSON, mas não um array`, parsed);
        return [];
      }
    } catch (error) {
      console.error(`simulateGetFromRedis: Erro ao parse de ${key}`, error);
      return [];
    }
  }

  console.warn(`simulateGetFromRedis: ${key} tem tipo inesperado ${typeof data}`);
  return [];
}

// Executa a função principal
seedProducts(); 