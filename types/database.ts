// Database model types based on the provided tables

export interface Procedure {
  id: string
  name: string
  category: string // CERVICAL, TL, etc.
  description?: string
  isActive: boolean
}

export interface Country {
  id: string
  name: string
  code: string // BR, CO, MX, etc.
  hasTiers: boolean
  numberOfTiers: number
  isActive: boolean
}

export interface ProductType {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  productTypeId: string
  procedureId: string
  productTier: "Tier 1" | "Tier 2"
  productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
  description?: string
  isActive: boolean
}

export interface Status {
  id: string
  code: string // Available, Not Planned, RA Submitted, RA To be submitted
  name: string
  color: string // For UI representation
  description?: string
  isActive: boolean
}

export interface StatusPortfolio {
  id: string
  productId: string
  countryId: string
  statusId: string
  setsQty?: string // Number of sets quantity
  lastUpdated: string // ISO date string
  updatedBy?: string // User ID
  notes?: string
}

// Composite/View types for UI
export interface PortfolioStatusView {
  id: string
  category: string
  procedure: string
  procedureId: string
  productType: string
  productTypeId: string
  product: string
  productId: string
  productTier: string
  productLifeCycle: string
  countryStatuses: {
    countryId: string
    countryName: string
    statusId: string
    statusCode: string
    statusName: string
    statusColor: string
    lastUpdated: string
    setsQty?: string // Add setsQty to countryStatuses as well
  }[]
}
