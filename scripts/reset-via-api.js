const http = require('http');

async function resetProducts() {
  console.log('Iniciando reset de produtos via API...');
  
  // Fazer uma requisição POST para a API de debug/products com produtos vazios
  // e forceReplace = true
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Resposta da API:', result);
          resolve(result);
        } catch (error) {
          console.error('Erro ao processar resposta:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Erro na requisição:', error);
      reject(error);
    });
    
    // Enviar os dados da requisição
    req.write(JSON.stringify({
      products: [],
      forceReplace: true
    }));
    
    req.end();
  });
}

// Verificar se o servidor está rodando
console.log('Certifique-se de que o servidor está rodando na porta 3000!');
console.log('Tentando resetar produtos em 3 segundos...');

setTimeout(() => {
  resetProducts()
    .then(() => {
      console.log('Reset de produtos concluído.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Falha ao resetar produtos:', error);
      process.exit(1);
    });
}, 3000); 