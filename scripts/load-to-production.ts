// scripts/load-to-production.ts
import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'

// Carregar variáveis do ambiente de produção
dotenv.config({ path: '.env.production.local' })

import {
  procedures,
  countries,
  productTypes,
  products,
  statuses,
  statusPortfolios,
  portfolioStatusView,
} from '../data/mock-data'

async function main() {
  // Configurar Redis diretamente com as variáveis de ambiente
  let url = process.env.UPSTASH_REDIS_REST_URL || ''
  let token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
  
  // Remover aspas extras se existirem
  url = url.replace(/^["'](.*)["']$/, '$1')
  token = token.replace(/^["'](.*)["']$/, '$1')
  
  if (!url || !token) {
    console.error('❌ URL ou token do Redis não configurados')
    process.exit(1)
  }
  
  console.log('🔍 Conectando ao Redis URL:', url)
  
  const redis = new Redis({ url, token })
  
  // Carregar todos os dados
  await redis.set('procedures', JSON.stringify(procedures))
  await redis.set('countries', JSON.stringify(countries))
  await redis.set('productTypes', JSON.stringify(productTypes))
  await redis.set('products', JSON.stringify(products))
  await redis.set('statuses', JSON.stringify(statuses))
  await redis.set('statusPortfolios', JSON.stringify(statusPortfolios))
  await redis.set('portfolioStatusView', JSON.stringify(portfolioStatusView))

  // Verificar se os dados foram carregados
  const countriesCheck = await redis.get('countries')
  
  // Verificar o tipo do dado retornado
  let count = 0
  if (countriesCheck) {
    if (typeof countriesCheck === 'string') {
      try {
        count = JSON.parse(countriesCheck).length
      } catch (e: any) {
        console.warn('Erro ao parsear JSON:', e.message)
      }
    } else if (Array.isArray(countriesCheck)) {
      count = countriesCheck.length
    } else if (typeof countriesCheck === 'object') {
      console.log('Tipo de retorno do Redis:', countriesCheck)
    }
  }
  
  console.log(`✅ Verificação: ${count} países carregados`)
  
  console.log('✅ Todos os dados carregados no Redis de produção com sucesso!')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro ao carregar dados:', err)
  process.exit(1)
}) 