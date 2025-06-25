"use client"
import { useState, useEffect } from "react"
import { Check, Filter, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUpdateStatus } from "@/hooks/usePortfolioData"
import type { Country, PortfolioStatusView, Procedure, Status } from "@/types/database"

interface StatusUpdateFormProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  procedures: Procedure[]
  statuses: Status[]
  onDataUpdate?: () => void // Callback to refresh parent data
}

type EditableItem = PortfolioStatusView & {
  isModified?: boolean
  modifiedStatuses?: Record<string, string>
}

export function StatusUpdateForm({ portfolioData, countries, procedures, statuses, onDataUpdate }: StatusUpdateFormProps) {
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [procedureFilter, setProcedureFilter] = useState<string>("all")
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editableData, setEditableData] = useState<EditableItem[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  
  // Use our custom hook for updates
  const { updateStatus, isUpdating } = useUpdateStatus()

  // Initialize editable data
  useEffect(() => {
    setEditableData(
      portfolioData.map((item) => ({
        ...item,
        isModified: false,
        modifiedStatuses: {},
      })),
    )
  }, [portfolioData])

  // Get unique product types based on procedure filter (commented out as not currently used)
  // const productTypes = Array.from(
  //   new Set(
  //     portfolioData
  //       .filter((item) => procedureFilter === "all" || item.procedureId === procedureFilter)
  //       .map((item) => ({ id: item.productTypeId, name: item.productType })),
  //   ),
  // )

  // Apply filters to get filtered data
  const filteredData = editableData.filter((item) => {
    const matchesCountry = countryFilter === "all" || item.countryStatuses.some((cs) => cs.countryId === countryFilter)
    const matchesProcedure = procedureFilter === "all" || item.procedureId === procedureFilter
    const matchesProductType = productTypeFilter === "all" || item.productTypeId === productTypeFilter
    const matchesStatus = statusFilter === "all" || item.countryStatuses.some((cs) => cs.statusId === statusFilter)

    return matchesCountry && matchesProcedure && matchesProductType && matchesStatus
  })

  // Group filtered data by category, procedure, and product type
  const groupedData: Record<string, Record<string, Record<string, EditableItem[]>>> = {}

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

  const handleStatusChange = (itemId: string, countryId: string, statusId: string) => {
    const newData = [...editableData]
    const originalIndex = editableData.findIndex((item) => item.id === itemId)

    if (originalIndex !== -1) {
      // Initialize modifiedStatuses if not already present
      if (!newData[originalIndex].modifiedStatuses) {
        newData[originalIndex].modifiedStatuses = {}
      }

      // Store the modified status
      newData[originalIndex].modifiedStatuses[countryId] = statusId
      newData[originalIndex].isModified = true

      // Update the countryStatuses for UI display
      const countryStatusIndex = newData[originalIndex].countryStatuses.findIndex((cs) => cs.countryId === countryId)

      if (countryStatusIndex !== -1) {
        const status = statuses.find((s) => s.id === statusId)
        if (status) {
          newData[originalIndex].countryStatuses[countryStatusIndex] = {
            ...newData[originalIndex].countryStatuses[countryStatusIndex],
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            lastUpdated: new Date().toISOString(),
          }
        }
      } else {
        // If country status doesn't exist, create it
        const country = countries.find((c) => c.id === countryId)
        const status = statuses.find((s) => s.id === statusId)

        if (country && status) {
          newData[originalIndex].countryStatuses.push({
            countryId: country.id,
            countryName: country.name,
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            lastUpdated: new Date().toISOString(),
          })
        }
      }

      setEditableData(newData)
    }
  }

  const handleSave = async () => {
    // Collect all updates
    const updates: {
      productId: string
      countryId: string
      statusId: string
    }[] = []

    editableData
      .filter((item) => item.isModified)
      .forEach((item) => {
        if (item.modifiedStatuses) {
          Object.entries(item.modifiedStatuses).forEach(([countryId, statusId]) => {
            updates.push({
              productId: item.productId,
              countryId,
              statusId,
            })
          })
        }
      })

    // Save updates
    if (updates.length > 0) {
      try {
        // Use our custom hook for updating
        const result = await updateStatus(updates);
        console.log('Update result:', result);

        // Show success message
        setSuccessMessage(`Status atualizado com sucesso para ${updates.length} itens`);

        // Reset modified flags
        setEditableData(
          editableData.map((item) => ({
            ...item,
            isModified: false,
            modifiedStatuses: {},
          }))
        );

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("")
        }, 3000)

        // Notify parent to refresh data if callback provided
        if (onDataUpdate) {
          // Give some time for the backend to process
          setTimeout(() => {
            onDataUpdate()
          }, 1000)
        }
      } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        setSuccessMessage(`Erro ao salvar: ${error instanceof Error ? error.message : String(error)}`);
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("")
        }, 5000)
      }
    } else {
      setSuccessMessage("Nenhuma alteração para salvar")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }

  const getStatusColor = (status: Status, isModified = false) => {
    if (isModified) {
      return "#E5F6FF" // Light blue for modified items
    }
    return status.color
  }

  const resetFilters = () => {
    setCountryFilter("all")
    setProcedureFilter("all")
    setProductTypeFilter("all")
    setStatusFilter("all")
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Update Product Status</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {successMessage && (
        <Card className={`mb-6 ${successMessage.includes('Erro') ? 'border-red-500' : 'border-green-500'}`}>
          <CardContent className="p-4">
            <div className={`flex items-center gap-2 ${successMessage.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
              {successMessage.includes('Erro') ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
              <p>{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Procedure</label>
                <Select value={procedureFilter} onValueChange={setProcedureFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by procedure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Procedures</SelectItem>
                    {procedures
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((procedure) => (
                        <SelectItem key={procedure.id} value={procedure.id}>
                          {procedure.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type</label>
                <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Product Types</SelectItem>
                    {Array.from(
                      new Set(editableData.map((item) => item.productType))
                    )
                      .sort((a, b) => a.localeCompare(b))
                      .map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-6">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="border w-[120px] bg-gray-100">Categoria</TableHead>
              <TableHead className="border w-[150px] bg-gray-100">Procedimento</TableHead>
              <TableHead className="border w-[150px] bg-gray-100">Tipo de Produto</TableHead>
              {countries.map((country) => (
                <TableHead key={country.id} colSpan={2} className="border text-center bg-gray-100">
                  {country.name}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {countries.flatMap((country) => [
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

                        {countries.flatMap((country) => {
                          // Tier 1 cell
                          const tier1Item = tier1Items.find(() => true) // Get first item if exists
                          const tier1Status = tier1Item?.countryStatuses.find((cs) => cs.countryId === country.id)
                          const tier1StatusObj = tier1Status
                            ? statuses.find((s) => s.id === tier1Status.statusId) || statuses[4]
                            : statuses[4]
                          const tier1IsModified = tier1Item?.modifiedStatuses?.[country.id] !== undefined

                          // Tier 2 cell
                          const tier2Item = tier2Items.find(() => true) // Get first item if exists
                          const tier2Status = tier2Item?.countryStatuses.find((cs) => cs.countryId === country.id)
                          const tier2StatusObj = tier2Status
                            ? statuses.find((s) => s.id === tier2Status.statusId) || statuses[4]
                            : statuses[4]
                          const tier2IsModified = tier2Item?.modifiedStatuses?.[country.id] !== undefined

                          return [
                            // Tier 1 cell
                            <TableCell
                              key={`${category}-${procedure}-${productType}-${country.id}-tier1`}
                              className="border p-0"
                            >
                              {tier1Item ? (
                                <>
                                  <Select
                                    value={tier1Status?.statusId || "status-5"}
                                    onValueChange={(value) => handleStatusChange(tier1Item.id, country.id, value)}
                                  >
                                    <SelectTrigger
                                      className="border-0 h-10 rounded-none"
                                      style={{ backgroundColor: getStatusColor(tier1StatusObj, tier1IsModified) }}
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
                                  <div className="text-xs text-center text-gray-700 pb-1">
                                    {tier1Item.product} ({tier1Item.productLifeCycle})
                                  </div>
                                </>
                              ) : (
                                <div className="h-10 flex items-center justify-center text-gray-400 text-xs">-</div>
                              )}
                            </TableCell>,

                            // Tier 2 cell
                            <TableCell
                              key={`${category}-${procedure}-${productType}-${country.id}-tier2`}
                              className="border p-0"
                            >
                              {tier2Item ? (
                                <>
                                  <Select
                                    value={tier2Status?.statusId || "status-5"}
                                    onValueChange={(value) => handleStatusChange(tier2Item.id, country.id, value)}
                                  >
                                    <SelectTrigger
                                      className="border-0 h-10 rounded-none"
                                      style={{ backgroundColor: getStatusColor(tier2StatusObj, tier2IsModified) }}
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
                                  <div className="text-xs text-center text-gray-700 pb-1">
                                    {tier2Item.product} ({tier2Item.productLifeCycle})
                                  </div>
                                </>
                              ) : (
                                <div className="h-10 flex items-center justify-center text-gray-400 text-xs">-</div>
                              )}
                            </TableCell>,
                          ]
                        })}
                      </TableRow>
                    )
                  }),
                ),
              )
            ) : (
              <TableRow>
                <TableCell colSpan={3 + countries.length * 2} className="h-24 text-center">
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
        disabled={!editableData.some((item) => item.isModified) || isUpdating}
      >
        {isUpdating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </>
        )}
      </Button>
    </div>
  )
}
