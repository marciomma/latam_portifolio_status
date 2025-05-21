/**
 * Script para testar a conexão com Redis e verificar integridade dos dados
 * Executar com: node scripts/test-redis-connection.js
 */

const { Redis } = require('@upstash/redis');

// Função para inicializar o cliente Redis
const getRedisClient = () => {
  // Valores fixos para desenvolvimento
  const url = "https://united-mammal-20071.upstash.io";
  const token = "AU5nAAIjcDFmM2ZiZjU3NjMxZDQ0YWY1OTIyMmZlMzgxMDgzMTkzYXAxMA";
  
  console.log('Conectando ao Redis usando:');
  console.log('- URL:', url);
  console.log('- Token definido:', !!token);
  
  return new Redis({ 
    url, 
    token,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 5000)
    }
  });
};

// Função para dormir
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função principal
async function main() {
  console.log('Iniciando teste de conexão Redis...');
  
  try {
    // Criar cliente
    const redis = getRedisClient();
    
    // Teste 1: Tentar operação ping
    console.log('\n🔍 Teste 1: Verificando conexão com PING');
    const testKey = '__test_ping__';
    
    try {
      await redis.set(testKey, 'PING');
      const pingResult = await redis.get(testKey);
      
      if (pingResult === 'PING') {
        console.log('✅ PING bem-sucedido!');
      } else {
        console.log('❌ PING falhou. Resultado:', pingResult);
      }
      
      await redis.del(testKey);
    } catch (error) {
      console.error('❌ Erro ao executar PING:', error);
    }
    
    // Teste 2: Listar todas as chaves
    console.log('\n🔍 Teste 2: Listando chaves');
    try {
      const keys = await redis.keys('*');
      console.log(`✅ ${keys.length} chaves encontradas:`);
      
      if (keys.length === 0) {
        console.log('   Nenhuma chave encontrada no banco');
      } else {
        keys.forEach(key => console.log(`   - ${key}`));
      }
    } catch (error) {
      console.error('❌ Erro ao listar chaves:', error);
    }
    
    // Teste 3: Verificar produtos
    console.log('\n🔍 Teste 3: Verificando dados de produtos');
    try {
      const productsRaw = await redis.get('products');
      
      if (!productsRaw) {
        console.log('❌ Nenhum produto encontrado na chave "products"');
      } else {
        if (typeof productsRaw === 'string') {
          console.log('✅ Produtos retornados como string (formato esperado)');
          console.log(`   Tamanho da string: ${productsRaw.length} caracteres`);
          
          try {
            const products = JSON.parse(productsRaw);
            
            if (Array.isArray(products)) {
              console.log(`✅ String JSON válida contendo ${products.length} produtos:`);
              products.slice(0, 3).forEach((product, i) => 
                console.log(`   ${i+1}. ${product.name} (ID: ${product.id})`)
              );
              
              if (products.length > 3) {
                console.log(`   ... e mais ${products.length - 3} produtos`);
              }
            } else {
              console.log('❌ Conteúdo não é um array JSON válido:', typeof products);
            }
          } catch (err) {
            console.error('❌ Erro ao parsear JSON de produtos:', err);
            console.log('   Primeiros 100 caracteres:', productsRaw.substring(0, 100));
          }
        } else if (Array.isArray(productsRaw)) {
          console.log(`✅ Produtos retornados diretamente como array com ${productsRaw.length} itens`);
          productsRaw.slice(0, 3).forEach((product, i) => 
            console.log(`   ${i+1}. ${product.name} (ID: ${product.id})`)
          );
        } else {
          console.log('❌ Formato inesperado para produtos:', typeof productsRaw);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar produtos:', error);
    }
    
    // Teste 4: Teste de escrita/leitura
    console.log('\n🔍 Teste 4: Teste de escrita e leitura');
    const testObj = { test: true, timestamp: Date.now() };
    const testJsonKey = '__test_json__';
    
    try {
      // Escrever como JSON
      const jsonStr = JSON.stringify(testObj);
      await redis.set(testJsonKey, jsonStr);
      console.log(`✅ Objeto JSON salvo com ${jsonStr.length} caracteres`);
      
      // Ler de volta
      const readResult = await redis.get(testJsonKey);
      
      if (!readResult) {
        console.log('❌ Leitura falhou: valor nulo retornado');
      } else if (typeof readResult === 'string') {
        console.log('✅ Leitura bem-sucedida: string retornada');
        
        if (readResult === jsonStr) {
          console.log('✅ Conteúdo idêntico verificado');
        } else {
          console.log(`❌ Conteúdo diferente: enviado ${jsonStr.length} caracteres, recebido ${readResult.length}`);
        }
        
        try {
          const parsedObj = JSON.parse(readResult);
          console.log('✅ String é um JSON válido:', parsedObj);
        } catch (e) {
          console.error('❌ String não é um JSON válido:', e);
        }
      } else {
        console.log(`❌ Tipo inesperado retornado: ${typeof readResult}`);
      }
      
      // Limpar
      await redis.del(testJsonKey);
      console.log('✅ Chave de teste removida');
    } catch (error) {
      console.error('❌ Erro no teste de escrita/leitura:', error);
    }
    
    console.log('\n✅ Testes concluídos!');
  } catch (error) {
    console.error('\n❌ Erro fatal nos testes:', error);
  }
}

// Executar testes
main().catch(error => {
  console.error('Erro não tratado:', error);
  process.exit(1);
}); 