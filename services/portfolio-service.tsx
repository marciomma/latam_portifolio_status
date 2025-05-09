// services/portfolio-service.tsx

import {
  portfolioStatusView,
  procedures,
  countries,
  productTypes,
  products,
  statuses,
  statusPortfolios,
} from "@/data/mock-data"
import type {
  Procedure,
  Country,
  ProductType,
  Product,
  Status,
  StatusPortfolio,
  PortfolioStatusView,
} from "@/types/database"

class PortfolioService {
  static getPortfolioStatusView(): PortfolioStatusView[] {
    return portfolioStatusView
  }

  static getProcedures(): Procedure[] {
    return procedures
  }

  static getCountries(): Country[] {
    return countries
  }

  static getProductTypes(): ProductType[] {
    return productTypes
  }

  static getProducts(): Product[] {
    return products
  }

  static getStatuses(): Status[] {
    return statuses
  }

  static getStatusPortfolios(): StatusPortfolio[] {
    return statusPortfolios
  }

  static async updateProduct(product: {
    id: string
    name: string
    procedureId: string
    productTypeId: string
    productTier: "Tier 1" | "Tier 2"
    productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
    isActive: boolean
    description?: string
  }): Promise<boolean> {
    console.log("Updating product:", product)
    return true // Indicate success for now
  }

  static async bulkUpdateProducts(products: any[]): Promise<boolean> {
    console.log("Bulk updating products:", products)
    return true // Indicate success for now
  }

  static async deleteProducts(productIds: string[]): Promise<boolean> {
    console.log("Deleting products:", productIds)
    return true // Indicate success for now
  }

  static async bulkUpdateStatus(
    updates: { productId: string; countryId: string; statusId: string }[],
  ): Promise<boolean> {
    console.log("Bulk updating statuses:", updates)
    return true
  }

  static async updateProcedure(procedure: {
    id: string
    name: string
    category: string
    description: string
    isActive: boolean
  }): Promise<boolean> {
    console.log("Updating procedure:", procedure)
    return true // Indicate success for now
  }

  static async bulkUpdateProcedures(procedures: any[]): Promise<boolean> {
    console.log("Bulk updating procedures:", procedures)
    return true // Indicate success for now
  }

  static async deleteProcedures(procedureIds: string[]): Promise<boolean> {
    console.log("Deleting procedures:", procedureIds)
    return true // Indicate success for now
  }
}

export { PortfolioService }
