// scripts/reset-products.js
// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: '.env.local' });

const { Redis } = require('@upstash/redis');

// Função para inicializar o cliente Redis
const getRedisClient = () => {
  // Pegar as variáveis direto do arquivo .env.local se presente, ou usar valores padrão
  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Usar valores fixos se as variáveis de ambiente não estiverem definidas
  if (!url) {
    url = "https://united-mammal-20071.upstash.io";
    console.log('Usando URL do Redis hard-coded');
  }
  
  if (!token) {
    token = "AU5nAAIjcDFmM2ZiZjU3NjMxZDQ0YWY1OTIyMmZlMzgxMDgzMTkzYXAxMA";
    console.log('Usando token do Redis hard-coded');
  }

  console.log('URL do Redis:', url);
  console.log('Token do Redis está definido:', !!token);

  return new Redis({ url, token });
};

// Função para pegar produtos existentes como backup
async function getProducts(redis) {
  try {
    const data = await redis.get('products');
    
    if (!data) {
      return [];
    }

    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return [];
  }
}

// Função principal
async function resetProducts() {
  console.log('Iniciando reset de produtos...');
  
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

    // Reinicializar com array vazio - forçando string JSON
    const emptyArray = JSON.stringify([]);
    console.log('Inicializando produtos com array vazio...');
    console.log('Valor a ser salvo:', emptyArray);
    
    // Tentar salvar diretamente como string
    const result = await redis.set('products', emptyArray);
    console.log(`Inicialização concluída. Resultado: ${result}`);

    // Verificar se a inicialização foi bem-sucedida
    const verification = await redis.get('products');
    console.log('Tipo de dado recuperado:', typeof verification);
    console.log('Valor recuperado:', verification);
    
    // Testar a conversão para verificar se é um JSON válido
    if (typeof verification === 'string') {
      try {
        const parsed = JSON.parse(verification);
        if (Array.isArray(parsed)) {
          console.log('Verificação bem-sucedida: produtos inicializados como array vazio.');
        } else {
          console.error('Verificação falhou: os produtos não são um array.');
        }
      } catch (e) {
        console.error('Verificação falhou: JSON inválido.');
      }
    } else if (Array.isArray(verification)) {
      console.log('Verificação parcial: Redis retornou um array diretamente. Isso pode funcionar mas não é ideal.');
    } else {
      console.error(`Verificação falhou: tipo inesperado (${typeof verification}).`);
    }

    console.log('Reset de produtos concluído.');
  } catch (error) {
    console.error('Erro durante reset de produtos:', error);
  }
  
  process.exit(0);
}

// Executa a função principal
resetProducts(); 