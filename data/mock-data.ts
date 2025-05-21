import type {
  Procedure,
  Country,
  ProductType,
  Product,
  Status,
  StatusPortfolio,
  PortfolioStatusView,
} from "@/types/database"

// Mock data for the database tables

export const procedures: Procedure[] = [
  { id: "proc-1", name: "ACDF", category: "CERVICAL", isActive: true },
  { id: "proc-2", name: "Corpectomy", category: "CERVICAL", isActive: true },
  { id: "proc-3", name: "cTDR", category: "CERVICAL", isActive: true },
  { id: "proc-4", name: "PCF", category: "CERVICAL", isActive: true },
  { id: "proc-5", name: "Fixation", category: "CERVICAL", isActive: true },
  { id: "proc-6", name: "Pediatric", category: "TL", isActive: true },
  { id: "proc-7", name: "Corpectomy", category: "TL", isActive: true },
]

export const countries: Country[] = [
  { id: "country-1", name: "Brazil", code: "BR", hasTiers: true, numberOfTiers: 2, isActive: true },
  { id: "country-2", name: "Colombia", code: "CO", hasTiers: true, numberOfTiers: 2, isActive: true },
  { id: "country-3", name: "Mexico", code: "MX", hasTiers: true, numberOfTiers: 2, isActive: true },
]

export const productTypes: ProductType[] = [
  { id: "type-1", name: "Retractor", isActive: true },
  { id: "type-2", name: "Odontoid", isActive: true },
  { id: "type-3", name: "Interbody", isActive: true },
  { id: "type-4", name: "Plate", isActive: true },
  { id: "type-5", name: "I. Interfixated", isActive: true },
  { id: "type-6", name: "Exp.", isActive: true },
  { id: "type-7", name: "Static", isActive: true },
  { id: "type-8", name: "cTDR", isActive: true },
  { id: "type-9", name: "PCF", isActive: true },
  { id: "type-10", name: "Laminoplasty", isActive: true },
  { id: "type-11", name: "Facet", isActive: true },
  { id: "type-12", name: "Open", isActive: true },
  { id: "type-13", name: "MAS", isActive: true },
  { id: "type-14", name: "Sub Band", isActive: true },
  { id: "type-15", name: "Tethering", isActive: true },
  { id: "type-16", name: "Fixation", isActive: true },
  { id: "type-17", name: "G Rod", isActive: true },
  { id: "type-18", name: "Exp", isActive: true },
]

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Retractor System A",
    productTypeId: "type-1",
    procedureId: "proc-1",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-2",
    name: "Odontoid Screw B",
    productTypeId: "type-2",
    procedureId: "proc-1",
    productTier: "Tier 2",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-3",
    name: "Cervical Interbody C",
    productTypeId: "type-3",
    procedureId: "proc-1",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-4",
    name: "Anterior Plate D",
    productTypeId: "type-4",
    procedureId: "proc-1",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-5",
    name: "Interfixation System E",
    productTypeId: "type-5",
    procedureId: "proc-1",
    productTier: "Tier 2",
    productLifeCycle: "De-emphasize",
    isActive: true,
  },
  {
    id: "prod-6",
    name: "Expandable Cage F",
    productTypeId: "type-6",
    procedureId: "proc-2",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-7",
    name: "Static Cage G",
    productTypeId: "type-7",
    procedureId: "proc-2",
    productTier: "Tier 2",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-8",
    name: "Cervical Disc H",
    productTypeId: "type-8",
    procedureId: "proc-3",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-9",
    name: "PCF System I",
    productTypeId: "type-9",
    procedureId: "proc-4",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-10",
    name: "Laminoplasty System J",
    productTypeId: "type-10",
    procedureId: "proc-4",
    productTier: "Tier 2",
    productLifeCycle: "De-emphasize",
    isActive: true,
  },
  {
    id: "prod-11",
    name: "Facet System K",
    productTypeId: "type-11",
    procedureId: "proc-5",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-12",
    name: "Open Fixation L",
    productTypeId: "type-12",
    procedureId: "proc-5",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-13",
    name: "MAS System M",
    productTypeId: "type-13",
    procedureId: "proc-5",
    productTier: "Tier 2",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-14",
    name: "Sub Band System N",
    productTypeId: "type-14",
    procedureId: "proc-6",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-15",
    name: "Tethering System O",
    productTypeId: "type-15",
    procedureId: "proc-6",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-16",
    name: "Pediatric Fixation P",
    productTypeId: "type-16",
    procedureId: "proc-6",
    productTier: "Tier 2",
    productLifeCycle: "Maintain",
    isActive: true,
  },
  {
    id: "prod-17",
    name: "Growth Rod Q",
    productTypeId: "type-17",
    procedureId: "proc-6",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-18",
    name: "Expandable TL Cage R",
    productTypeId: "type-18",
    procedureId: "proc-7",
    productTier: "Tier 1",
    productLifeCycle: "Flagship",
    isActive: true,
  },
  {
    id: "prod-19",
    name: "Static TL Cage S",
    productTypeId: "type-7",
    procedureId: "proc-7",
    productTier: "Tier 2",
    productLifeCycle: "Maintain",
    isActive: true,
  },
]

export const statuses: Status[] = [
  { id: "status-1", code: "Available", name: "Available", color: "#7CD992", isActive: true },
  { id: "status-2", code: "RA Submitted", name: "RA Submitted", color: "#A8A8A8", isActive: true },
  { id: "status-3", code: "RA To be submitted", name: "RA To be submitted", color: "#EB6060", isActive: true },
  { id: "status-4", code: "Not Planned", name: "Not Planned", color: "#F7E463", isActive: true },
  { id: "status-5", code: "", name: "None", color: "#FFFFFF", isActive: true },
]

// Generate mock status portfolios
export const statusPortfolios: StatusPortfolio[] = [
  // Brazil - Retractor System A
  {
    id: "sp-1",
    productId: "prod-1",
    countryId: "country-1",
    statusId: "status-1", // Available
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Colombia - Retractor System A
  {
    id: "sp-2",
    productId: "prod-1",
    countryId: "country-2",
    statusId: "status-1", // Available
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Mexico - Retractor System A
  {
    id: "sp-3",
    productId: "prod-1",
    countryId: "country-3",
    statusId: "status-1", // Available
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Brazil - Odontoid Screw B
  {
    id: "sp-4",
    productId: "prod-2",
    countryId: "country-1",
    statusId: "status-2", // Not Planned
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Colombia - Odontoid Screw B
  {
    id: "sp-5",
    productId: "prod-2",
    countryId: "country-2",
    statusId: "status-2", // Not Planned
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Mexico - Odontoid Screw B
  {
    id: "sp-6",
    productId: "prod-2",
    countryId: "country-3",
    statusId: "status-2", // Not Planned
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Brazil - Cervical Interbody C
  {
    id: "sp-7",
    productId: "prod-3",
    countryId: "country-1",
    statusId: "status-3", // RA Submitted
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Colombia - Cervical Interbody C
  {
    id: "sp-8",
    productId: "prod-3",
    countryId: "country-2",
    statusId: "status-3", // RA Submitted
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Mexico - Cervical Interbody C
  {
    id: "sp-9",
    productId: "prod-3",
    countryId: "country-3",
    statusId: "status-3", // RA Submitted
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Brazil - Anterior Plate D
  {
    id: "sp-10",
    productId: "prod-4",
    countryId: "country-1",
    statusId: "status-3", // RA Submitted
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Colombia - Anterior Plate D
  {
    id: "sp-11",
    productId: "prod-4",
    countryId: "country-2",
    statusId: "status-3", // RA Submitted
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Mexico - Anterior Plate D
  {
    id: "sp-12",
    productId: "prod-4",
    countryId: "country-3",
    statusId: "status-2", // Not Planned
    lastUpdated: "2023-05-15T10:30:00Z",
  },
  // Add more status portfolios for other products...
]

// Function to generate a view model from the database tables
export function generatePortfolioStatusView(): PortfolioStatusView[] {
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
      const statusId = portfolio?.statusId || "status-5"
      const status = statuses.find((s) => s.id === statusId) || statuses[4] // Default to "None"

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
}

// Generate the view model
export const portfolioStatusView = generatePortfolioStatusView()
