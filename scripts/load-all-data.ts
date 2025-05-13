import { redis } from '../lib/redis'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: '.env.local' })

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
  console.log('🔍 Redis URL:', process.env.UPSTASH_REDIS_REST_URL ? '[Configurado]' : '[Não configurado]')
  await redis.set('procedures', JSON.stringify(procedures))
  await redis.set('countries', JSON.stringify(countries))
  await redis.set('productTypes', JSON.stringify(productTypes))
  await redis.set('products', JSON.stringify(products))
  await redis.set('statuses', JSON.stringify(statuses))
  await redis.set('statusPortfolios', JSON.stringify(statusPortfolios))
  await redis.set('portfolioStatusView', JSON.stringify(portfolioStatusView))

  console.log('Todos os dados carregados no Redis com sucesso!')
  process.exit(0)
}

main()
