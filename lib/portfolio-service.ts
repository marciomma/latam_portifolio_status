import { getFromRedis } from '@/lib/data'

import type {
  Procedure,
  Country,
  ProductType,
  Product,
  Status,
  PortfolioStatusView,
  StatusPortfolio,
} from '@/types/database'

export class PortfolioService {
  static async getProcedures(): Promise<Procedure[]> {
    return getFromRedis<Procedure>('procedures')
  }

  static async getCountries(): Promise<Country[]> {
    return getFromRedis<Country>('countries')
  }

  static async getProductTypes(): Promise<ProductType[]> {
    return getFromRedis<ProductType>('productTypes')
  }

  static async getProducts(): Promise<Product[]> {
    return getFromRedis<Product>('products')
  }

  static async getStatuses(): Promise<Status[]> {
    return getFromRedis<Status>('statuses')
  }

  static async getStatusPortfolios(): Promise<StatusPortfolio[]> {
    return getFromRedis<StatusPortfolio>('statusPortfolios')
  }

  static async getPortfolioStatusView(): Promise<PortfolioStatusView[]> {
    return getFromRedis<PortfolioStatusView>('portfolioStatusView')
  }

  static async getProductsByProcedure(procedureId: string): Promise<Product[]> {
    const products = await this.getProducts()
    return products.filter((p) => p.procedureId === procedureId)
  }

  static async getPortfolioStatusViewByCountry(countryId: string): Promise<PortfolioStatusView[]> {
    const view = await this.getPortfolioStatusView()
    return view.map((item) => ({
      ...item,
      countryStatuses: item.countryStatuses.filter((cs) => cs.countryId === countryId),
    }))
  }

  static async updateStatus(productId: string, countryId: string, statusId: string, notes?: string): Promise<boolean> {
    // Esta função ainda está mockada; podemos persistir no Redis depois
    console.log(`[Simulado] Atualizando status de ${productId} em ${countryId} para ${statusId}`)
    return true
  }

  static async bulkUpdateStatus(updates: { productId: string, countryId: string, statusId: string, notes?: string }[]): Promise<boolean> {
    for (const update of updates) {
      await this.updateStatus(update.productId, update.countryId, update.statusId, update.notes)
    }
    return true
  }
}
