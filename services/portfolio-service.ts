// services/portfolio-service.ts
import { kv } from "@vercel/kv"
import {
  procedures as initialProcedures,
  countries as initialCountries,
  productTypes as initialProductTypes,
  products as initialProducts,
  statuses as initialStatuses,
  statusPortfolios as initialStatusPortfolios,
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
  // Initialize data if not exists
  static async initializeData() {
    try {
      const hasData = await kv.get("initialized")

      if (!hasData) {
        await kv.set("procedures", initialProcedures)
        await kv.set("countries", initialCountries)
        await kv.set("productTypes", initialProductTypes)
        await kv.set("products", initialProducts)
        await kv.set("statuses", initialStatuses)
        await kv.set("statusPortfolios", initialStatusPortfolios)
        await kv.set("initialized", true)
        console.log("Database initialized with mock data")
      }
    } catch (error) {
      console.error("Error initializing data:", error)
      throw error
    }
  }

  // Get all procedures
  static async getProcedures(): Promise<Procedure[]> {
    try {
      await this.initializeData()
      const procedures = await kv.get<Procedure[]>("procedures")
      return procedures || initialProcedures
    } catch (error) {
      console.error("Error getting procedures:", error)
      return initialProcedures
    }
  }

  // Get all countries
  static async getCountries(): Promise<Country[]> {
    try {
      await this.initializeData()
      const countries = await kv.get<Country[]>("countries")
      return countries || initialCountries
    } catch (error) {
      console.error("Error getting countries:", error)
      return initialCountries
    }
  }

  // Get all product types
  static async getProductTypes(): Promise<ProductType[]> {
    try {
      await this.initializeData()
      const productTypes = await kv.get<ProductType[]>("productTypes")
      return productTypes || initialProductTypes
    } catch (error) {
      console.error("Error getting product types:", error)
      return initialProductTypes
    }
  }

  // Get all products
  static async getProducts(): Promise<Product[]> {
    try {
      await this.initializeData()
      const products = await kv.get<Product[]>("products")
      return products || initialProducts
    } catch (error) {
      console.error("Error getting products:", error)
      return initialProducts
    }
  }

  // Get products by procedure
  static async getProductsByProcedure(procedureId: string): Promise<Product[]> {
    try {
      const products = await this.getProducts()
      return products.filter((product) => product.procedureId === procedureId)
    } catch (error) {
      console.error("Error getting products by procedure:", error)
      return initialProducts.filter((product) => product.procedureId === procedureId)
    }
  }

  // Get all statuses
  static async getStatuses(): Promise<Status[]> {
    try {
      await this.initializeData()
      const statuses = await kv.get<Status[]>("statuses")
      return statuses || initialStatuses
    } catch (error) {
      console.error("Error getting statuses:", error)
      return initialStatuses
    }
  }

  // Get all status portfolios
  static async getStatusPortfolios(): Promise<StatusPortfolio[]> {
    try {
      await this.initializeData()
      const statusPortfolios = await kv.get<StatusPortfolio[]>("statusPortfolios")
      return statusPortfolios || initialStatusPortfolios
    } catch (error) {
      console.error("Error getting status portfolios:", error)
      return initialStatusPortfolios
    }
  }

  // Get portfolio status view
  static async getPortfolioStatusView(): Promise<PortfolioStatusView[]> {
    try {
      const products = await this.getProducts()
      const procedures = await this.getProcedures()
      const productTypes = await this.getProductTypes()
      const countries = await this.getCountries()
      const statuses = await this.getStatuses()
      const statusPortfolios = await this.getStatusPortfolios()

      const result: PortfolioStatusView[] = []

      // For each product
      products.forEach((product) => {
        const procedure = procedures.find((p) => p.id === product.procedureId)
        const productType = productTypes.find((pt) => pt.id === product.productTypeId)

        if (!procedure || !productType) return

        const countryStatuses = countries.map((country) => {
          // Find status portfolio for this product and country
          const portfolio = statusPortfolios.find((sp) => sp.productId === product.id && sp.countryId === country.id)

          // If no portfolio exists, use a default "none" status
          const statusId = portfolio?.statusId || statuses.find((s) => s.code === "")?.id || ""
          const status = statuses.find((s) => s.id === statusId) ||
            statuses.find((s) => s.code === "") || { id: "", code: "", name: "None", color: "#FFFFFF", isActive: true }

          return {
            countryId: country.id,
            countryName: country.name,
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            lastUpdated: portfolio?.lastUpdated || new Date().toISOString(),
          }
        })

        result.push({
          id: `view-${product.id}`,
          category: procedure.category,
          procedure: procedure.name,
          procedureId: procedure.id,
          productType: productType.name,
          productTypeId: productType.id,
          product: product.name,
          productId: product.id,
          productTier: product.productTier,
          productLifeCycle: product.productLifeCycle,
          countryStatuses,
        })
      })

      return result
    } catch (error) {
      console.error("Error generating portfolio status view:", error)
      return []
    }
  }

  // Update status for a product in a country
  static async updateStatus(productId: string, countryId: string, statusId: string, notes?: string): Promise<boolean> {
    try {
      // Get current status portfolios
      const statusPortfolios = await this.getStatusPortfolios()

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
          id: `sp-${Date.now()}`,
          productId,
          countryId,
          statusId,
          lastUpdated: new Date().toISOString(),
          notes,
        })
      }

      // Save updated status portfolios
      await kv.set("statusPortfolios", statusPortfolios)

      return true
    } catch (error) {
      console.error("Error updating status:", error)
      return false
    }
  }

  // Bulk update statuses
  static async bulkUpdateStatus(
    updates: {
      productId: string
      countryId: string
      statusId: string
      notes?: string
    }[],
  ): Promise<boolean> {
    try {
      // Get current status portfolios
      const statusPortfolios = await this.getStatusPortfolios()
      let updated = false

      // Process each update
      for (const update of updates) {
        const { productId, countryId, statusId, notes } = update

        // Find existing portfolio entry
        const existingIndex = statusPortfolios.findIndex(
          (sp) => sp.productId === productId && sp.countryId === countryId,
        )

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
            id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            productId,
            countryId,
            statusId,
            lastUpdated: new Date().toISOString(),
            notes,
          })
        }

        updated = true
      }

      if (updated) {
        // Save all updates at once
        await kv.set("statusPortfolios", statusPortfolios)
      }

      return true
    } catch (error) {
      console.error("Error bulk updating statuses:", error)
      return false
    }
  }

  // Update product
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
    try {
      const products = await this.getProducts()
      const index = products.findIndex((p) => p.id === product.id)

      if (index >= 0) {
        products[index] = product as Product
      } else {
        products.push(product as Product)
      }

      await kv.set("products", products)
      return true
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }

  // Bulk update products
  static async bulkUpdateProducts(products: Product[]): Promise<boolean> {
    try {
      const currentProducts = await this.getProducts()

      // Update or add each product
      for (const product of products) {
        const index = currentProducts.findIndex((p) => p.id === product.id)
        if (index >= 0) {
          currentProducts[index] = product
        } else {
          currentProducts.push(product)
        }
      }

      await kv.set("products", currentProducts)
      return true
    } catch (error) {
      console.error("Error bulk updating products:", error)
      return false
    }
  }

  // Delete products
  static async deleteProducts(productIds: string[]): Promise<boolean> {
    try {
      const products = await this.getProducts()
      const filteredProducts = products.filter((p) => !productIds.includes(p.id))

      // Also delete related status portfolios
      const statusPortfolios = await this.getStatusPortfolios()
      const filteredStatusPortfolios = statusPortfolios.filter((sp) => !productIds.includes(sp.productId))

      await kv.set("products", filteredProducts)
      await kv.set("statusPortfolios", filteredStatusPortfolios)

      return true
    } catch (error) {
      console.error("Error deleting products:", error)
      return false
    }
  }

  // Update procedure
  static async updateProcedure(procedure: Procedure): Promise<boolean> {
    try {
      const procedures = await this.getProcedures()
      const index = procedures.findIndex((p) => p.id === procedure.id)

      if (index >= 0) {
        procedures[index] = procedure
      } else {
        procedures.push(procedure)
      }

      await kv.set("procedures", procedures)
      return true
    } catch (error) {
      console.error("Error updating procedure:", error)
      return false
    }
  }

  // Bulk update procedures
  static async bulkUpdateProcedures(procedures: Procedure[]): Promise<boolean> {
    try {
      const currentProcedures = await this.getProcedures()

      // Update or add each procedure
      for (const procedure of procedures) {
        const index = currentProcedures.findIndex((p) => p.id === procedure.id)
        if (index >= 0) {
          currentProcedures[index] = procedure
        } else {
          currentProcedures.push(procedure)
        }
      }

      await kv.set("procedures", currentProcedures)
      return true
    } catch (error) {
      console.error("Error bulk updating procedures:", error)
      return false
    }
  }

  // Delete procedures
  static async deleteProcedures(procedureIds: string[]): Promise<boolean> {
    try {
      const procedures = await this.getProcedures()
      const filteredProcedures = procedures.filter((p) => !procedureIds.includes(p.id))

      await kv.set("procedures", filteredProcedures)

      return true
    } catch (error) {
      console.error("Error deleting procedures:", error)
      return false
    }
  }
}
