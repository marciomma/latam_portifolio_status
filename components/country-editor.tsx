"use client"

import { useState } from "react"
import { Check, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PortfolioService } from "@/services/portfolio-service"
import type { Country, PortfolioStatusView, Procedure, Status } from "@/types/database"

interface CountryEditorProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  procedures: Procedure[]
  statuses: Status[]
}

type EditableItem = {
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
  status: {
    statusId: string
    isModified: boolean
  }
}

export function CountryEditor({ portfolioData, countries, procedures, statuses }: CountryEditorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [editableData, setEditableData] = useState<EditableItem[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [procedureFilter, setProcedureFilter] = useState<string>("all")

  // Get unique categories
  const categories = Array.from(new Set(portfolioData.map((item) => item.category)))

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId)

    // Reset filters when changing country
    setCategoryFilter("all")
    setProcedureFilter("all")

    // Find the selected country
    const country = countries.find((c) => c.id === countryId)
    if (!country) return

    // Transform data for the selected country
    const countryData: EditableItem[] = portfolioData.map((item) => {
      const countryStatus = item.countryStatuses.find((cs) => cs.countryId === countryId)

      // Default values if no status exists
      let statusId = statuses.find((s) => s.code === "")?.id || ""

      // If country status exists, use those values
      if (countryStatus) {
        statusId = countryStatus.statusId
      }

      return {
        id: item.id,
        category: item.category,
        procedure: item.procedure,
        procedureId: item.procedureId,
        productType: item.productType,
        productTypeId: item.productTypeId,
        product: item.product,
        productId: item.productId,
        productTier: item.productTier,
        productLifeCycle: item.productLifeCycle,
        status: {
          statusId,
          isModified: false,
        },
      }
    })

    setEditableData(countryData)
  }

  const handleStatusChange = (index: number, statusId: string) => {
    const newData = [...editableData]
    newData[index].status = {
      statusId,
      isModified: true,
    }
    setEditableData(newData)
  }

  const handleSave = () => {
    // Collect all updates
    const updates: {
      productId: string
      countryId: string
      statusId: string
    }[] = []

    editableData.forEach((item) => {
      if (item.status.isModified) {
        updates.push({
          productId: item.productId,
          countryId: selectedCountry,
          statusId: item.status.statusId,
        })
      }
    })

    // Save updates
    if (updates.length > 0) {
      PortfolioService.bulkUpdateStatus(updates)

      // Show success message
      const countryName = countries.find((c) => c.id === selectedCountry)?.name || selectedCountry
      setSuccessMessage(`Status atualizado com sucesso para ${countryName} (${updates.length} alterações)`)

      // Reset modified flags
      setEditableData(
        editableData.map((item) => ({
          ...item,
          status: {
            ...item.status,
            isModified: false,
          },
        })),
      )
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  // Group data by category, procedure, and product type
  const groupedData: Record<string, Record<string, Record<string, EditableItem[]>>> = {}

  // Filter data based on selected category and procedure
  const filteredData = editableData.filter(
    (item) =>
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (procedureFilter === "all" || item.procedureId === procedureFilter),
  )

  // Group filtered data
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

  // Get procedures filtered by category
  const filteredProcedures = procedures.filter(
    (proc) =>
      categoryFilter === "all" ||
      portfolioData.some((item) => item.procedureId === proc.id && item.category === categoryFilter),
  )

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Editor de Status por País</h2>

      {successMessage && (
        <Card className="mb-6 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <p>{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={!selectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={procedureFilter} onValueChange={setProcedureFilter} disabled={!selectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por procedimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Procedimentos</SelectItem>
              {filteredProcedures.map((procedure) => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCountry ? (
        <>
          <div className="mb-4 overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border w-[120px] bg-gray-100">Categoria</TableHead>
                  <TableHead className="border w-[150px] bg-gray-100">Procedimento</TableHead>
                  <TableHead className="border w-[150px] bg-gray-100">Tipo de Produto</TableHead>
                  <TableHead className="border text-center bg-gray-100">
                    Status
                    <div className="text-xs font-normal">Tier / Produto</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedData).length > 0 ? (
                  Object.entries(groupedData).flatMap(([category, procedures]) =>
                    Object.entries(procedures).flatMap(([procedure, productTypes]) =>
                      Object.entries(productTypes).map(([productType, items]) => {
                        // Group items by tier
                        const tier1Items = items.filter((item) => item.productTier === "Tier 1")
                        const tier2Items = items.filter((item) => item.productTier === "Tier 2")

                        return (
                          <TableRow key={`${category}-${procedure}-${productType}`}>
                            <TableCell className="border">{category}</TableCell>
                            <TableCell className="border">{procedure}</TableCell>
                            <TableCell className="border">{productType}</TableCell>
                            <TableCell className="border p-0">
                              <div className="grid grid-cols-1 divide-y">
                                {tier1Items.map((item, index) => {
                                  const status = statuses.find((s) => s.id === item.status.statusId) || statuses[4]

                                  return (
                                    <div key={`tier1-${index}`} className="p-2">
                                      <div className="flex items-center gap-2">
                                        <Select
                                          value={item.status.statusId}
                                          onValueChange={(value) =>
                                            handleStatusChange(
                                              filteredData.findIndex((i) => i.id === item.id),
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger
                                            className="flex-1"
                                            style={{
                                              backgroundColor: item.status.isModified ? "#E5F6FF" : status.color,
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {statuses.map((status) => (
                                              <SelectItem key={status.id} value={status.id}>
                                                {status.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="mt-1 text-xs">
                                        <span className="font-medium">Tier 1:</span> {item.product} (
                                        {item.productLifeCycle})
                                      </div>
                                    </div>
                                  )
                                })}

                                {tier2Items.map((item, index) => {
                                  const status = statuses.find((s) => s.id === item.status.statusId) || statuses[4]

                                  return (
                                    <div key={`tier2-${index}`} className="p-2">
                                      <div className="flex items-center gap-2">
                                        <Select
                                          value={item.status.statusId}
                                          onValueChange={(value) =>
                                            handleStatusChange(
                                              filteredData.findIndex((i) => i.id === item.id),
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger
                                            className="flex-1"
                                            style={{
                                              backgroundColor: item.status.isModified ? "#E5F6FF" : status.color,
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {statuses.map((status) => (
                                              <SelectItem key={status.id} value={status.id}>
                                                {status.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="mt-1 text-xs">
                                        <span className="font-medium">Tier 2:</span> {item.product} (
                                        {item.productLifeCycle})
                                      </div>
                                    </div>
                                  )
                                })}

                                {tier1Items.length === 0 && tier2Items.length === 0 && (
                                  <div className="p-4 text-center text-gray-400 text-sm">Nenhum produto disponível</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }),
                    ),
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum resultado encontrado. Tente ajustar seus filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
            disabled={!editableData.some((item) => item.status.isModified)}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações para {countries.find((c) => c.id === selectedCountry)?.name}
          </Button>
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Selecione um país para editar os status dos produtos</p>
        </div>
      )}
    </div>
  )
}
