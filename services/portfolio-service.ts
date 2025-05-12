import {
  procedures,
  countries,
  productTypes,
  products,
  statuses,
  statusPortfolios,
  portfolioStatusView,
} from "@/data/mock-data"

import type {
  Procedure,
  Country,
  ProductType,
  Product,
  Status,
  PortfolioStatusView,
  StatusPortfolio,
} from "@/types/database"

// Service to handle portfolio data operations
export class PortfolioService {
  // Get all procedures
  static getProcedures(): Procedure[] {
    return procedures
  }

  // Get all countries
  static getCountries(): Country[] {
    return countries
  }

  // Get all product types
  static getProductTypes(): ProductType[] {
    return productTypes
  }

  // Get all products
  static getProducts(): Product[] {
    return products
  }

  // Get products by procedure
  static getProductsByProcedure(procedureId: string): Product[] {
    return products.filter((product) => product.procedureId === procedureId)
  }

  // Get all statuses
  static getStatuses(): Status[] {
    return statuses
  }

  // Get all status portfolios
  static getStatusPortfolios(): StatusPortfolio[] {
    return statusPortfolios
  }

  // Get portfolio status view
  static getPortfolioStatusView(): PortfolioStatusView[] {
    return portfolioStatusView
  }

  // Get portfolio status view filtered by country
  static getPortfolioStatusViewByCountry(countryId: string): PortfolioStatusView[] {
    return portfolioStatusView.map((item) => ({
      ...item,
      countryStatuses: item.countryStatuses.filter((cs) => cs.countryId === countryId),
    }))
  }

  // Update status for a product in a country
  static updateStatus(productId: string, countryId: string, statusId: string, notes?: string): boolean {
    // In a real app, this would update the database
    // For now, we'll just log the update
    console.log(`Updating status for product ${productId} in country ${countryId} to status ${statusId}`)

    // Find existing portfolio entry
    const existingIndex = statusPortfolios.findIndex((sp) => sp.productId === productId && sp.countryId === countryId)

    if (existingIndex >= 0) {
      // Update existing entry
      statusPortfolios[existingIndex] = {
        ...statusPortfolios[existingIndex],
        statusId,
        lastUpdated: new Date().toISOString(),
        notes,
      }
    } else {
      // Create new entry
      statusPortfolios.push({
        id: `sp-${statusPortfolios.length + 1}`,
        productId,
        countryId,
        statusId,
        lastUpdated: new Date().toISOString(),
        notes,
      })
    }

    return true
  }

  // Bulk update statuses
  static bulkUpdateStatus(
    updates: {
      productId: string
      countryId: string
      statusId: string
      notes?: string
    }[],
  ): boolean {
    // Process each update
    updates.forEach((update) => {
      this.updateStatus(update.productId, update.countryId, update.statusId, update.notes)
    })

    return true
  }
}
