"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Country, PortfolioStatusView, Procedure, ProductType } from "@/types/database"

interface StatusTableProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  selectedCountryIds: string[]
  procedures?: Procedure[]
  productTypes?: ProductType[]
}

export function StatusTable({
  portfolioData,
  countries,
  selectedCountryIds,
  procedures = [],
  productTypes = [],
}: StatusTableProps) {
  const [procedureFilter, setProcedureFilter] = useState<string>("all")
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all")
  const [lifeCycleFilter, setLifeCycleFilter] = useState<string>("all")

  // If no countries are selected, don't show the table
  if (selectedCountryIds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Selecione pelo menos um país para visualizar a tabela de status</p>
      </div>
    )
  }

  // Apply filters
  const filteredData = portfolioData.filter((item) => {
    const matchesProcedure = procedureFilter === "all" || item.procedureId === procedureFilter
    const matchesProductType = productTypeFilter === "all" || item.productTypeId === productTypeFilter
    const matchesLifeCycle = lifeCycleFilter === "all" || item.productLifeCycle === lifeCycleFilter
    return matchesProcedure && matchesProductType && matchesLifeCycle
  })

  // Group data by category, procedure, and product type
  const groupedData: Record<string, Record<string, Record<string, PortfolioStatusView[]>>> = {}

  filteredData.forEach((item) => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = {}
    }

    if (!groupedData[item.category][item.procedure]) {
      groupedData[item.category][item.procedure] = {}
    }

    if (!groupedData[item.category][item.procedure][item.productType]) {
      groupedData[item.category][item.procedure][item.productType] = []
    }

    groupedData[item.category][item.procedure][item.productType].push(item)
  })

  // Filter countries based on selection
  const filteredCountries = countries.filter((country) => selectedCountryIds.includes(country.id))

  return (
    <div>
      {/* Additional filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Procedimento</label>
          <Select value={procedureFilter} onValueChange={setProcedureFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por procedimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Procedimentos</SelectItem>
              {procedures.map((procedure) => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Produto</label>
          <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo de produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos de Produto</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ciclo de Vida</label>
          <Select value={lifeCycleFilter} onValueChange={setLifeCycleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ciclo de vida" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Ciclos de Vida</SelectItem>
              <SelectItem value="Flagship">Flagship</SelectItem>
              <SelectItem value="Maintain">Maintain</SelectItem>
              <SelectItem value="De-emphasize">De-emphasize</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="border w-[120px] bg-gray-100">
                Categoria
              </TableHead>
              <TableHead rowSpan={2} className="border w-[150px] bg-gray-100">
                Procedimento
              </TableHead>
              <TableHead rowSpan={2} className="border w-[150px] bg-gray-100">
                Tipo de Produto
              </TableHead>
              {filteredCountries.map((country) => (
                <TableHead key={country.id} colSpan={2} className="border text-center bg-gray-100">
                  {country.name}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {filteredCountries.flatMap((country) => [
                <TableHead key={`${country.id}-tier1`} className="border text-center bg-gray-50 text-xs">
                  Tier 1
                </TableHead>,
                <TableHead key={`${country.id}-tier2`} className="border text-center bg-gray-50 text-xs">
                  Tier 2
                </TableHead>,
              ])}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).map(([category, procedures]) => {
              // Calculate total rows for this category for rowspan
              const totalRows = Object.entries(procedures).reduce(
                (acc, [_, productTypes]) =>
                  acc +
                  Object.entries(productTypes).reduce(
                    (typeAcc, [__, products]) => typeAcc + (products.length > 0 ? 1 : 0),
                    0,
                  ),
                0,
              )

              let rowsRendered = 0

              return Object.entries(procedures).flatMap(([procedure, productTypes], procIndex) => {
                // Calculate total rows for this procedure
                const procedureRows = Object.entries(productTypes).reduce(
                  (acc, [_, products]) => acc + (products.length > 0 ? 1 : 0),
                  0,
                )

                let procRowsRendered = 0

                return Object.entries(productTypes).flatMap(([productType, products], typeIndex) => {
                  if (products.length === 0) return []

                  const isFirstInProcedure = procRowsRendered === 0
                  const isFirstInCategory = isFirstInProcedure && rowsRendered === 0

                  procRowsRendered += 1
                  rowsRendered += isFirstInProcedure ? 1 : 0

                  // Group products by tier
                  const tier1Products = products.filter((p) => p.productTier === "Tier 1")
                  const tier2Products = products.filter((p) => p.productTier === "Tier 2")

                  return (
                    <TableRow key={`${category}-${procedure}-${productType}`}>
                      {isFirstInCategory && (
                        <TableCell rowSpan={totalRows} className="border font-medium align-middle">
                          {category}
                        </TableCell>
                      )}
                      {isFirstInProcedure && (
                        <TableCell rowSpan={procedureRows} className="border align-middle">
                          {procedure}
                        </TableCell>
                      )}
                      <TableCell className="border">{productType}</TableCell>

                      {filteredCountries.flatMap((country) => {
                        // Tier 1 cell
                        const tier1Product = tier1Products.find((p) =>
                          p.countryStatuses.some((cs) => cs.countryId === country.id),
                        )

                        const tier1Status = tier1Product?.countryStatuses.find((cs) => cs.countryId === country.id)

                        // Tier 2 cell
                        const tier2Product = tier2Products.find((p) =>
                          p.countryStatuses.some((cs) => cs.countryId === country.id),
                        )

                        const tier2Status = tier2Product?.countryStatuses.find((cs) => cs.countryId === country.id)

                        return [
                          // Tier 1 cell
                          <TableCell
                            key={`${category}-${procedure}-${productType}-${country.id}-tier1`}
                            className="border text-center font-medium"
                            style={{
                              backgroundColor: tier1Status?.statusColor || "transparent",
                              color: tier1Status?.statusColor ? "black" : "gray",
                            }}
                          >
                            {tier1Product ? (
                              <div className="text-xs">
                                {tier1Product.product} ({tier1Product.productLifeCycle})
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">-</div>
                            )}
                          </TableCell>,

                          // Tier 2 cell
                          <TableCell
                            key={`${category}-${procedure}-${productType}-${country.id}-tier2`}
                            className="border text-center font-medium"
                            style={{
                              backgroundColor: tier2Status?.statusColor || "transparent",
                              color: tier2Status?.statusColor ? "black" : "gray",
                            }}
                          >
                            {tier2Product ? (
                              <div className="text-xs">
                                {tier2Product.product} ({tier2Product.productLifeCycle})
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">-</div>
                            )}
                          </TableCell>,
                        ]
                      })}
                    </TableRow>
                  )
                })
              })
            })}
            {Object.keys(groupedData).length === 0 && (
              <TableRow>
                <TableCell colSpan={3 + filteredCountries.length * 2} className="h-24 text-center">
                  Nenhum resultado encontrado. Tente ajustar seus filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
