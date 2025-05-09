"use client"

import { useState, useEffect } from "react"
import { Check, Filter, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PortfolioService } from "@/services/portfolio-service"
import type { Country, PortfolioStatusView, Procedure, Status } from "@/types/database"

interface StatusUpdateFormProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  procedures: Procedure[]
  statuses: Status[]
  onUpdate: () => Promise<void>
}

type EditableItem = PortfolioStatusView & {
  isModified?: boolean
  modifiedStatuses?: Record<string, string>
}

export function StatusUpdateForm({ portfolioData, countries, procedures, statuses, onUpdate }: StatusUpdateFormProps) {
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [procedureFilter, setProcedureFilter] = useState<string>("all")
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editableData, setEditableData] = useState<EditableItem[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Get unique product types based on procedure filter
  const productTypes = Array.from(
    new Set(
      portfolioData
        .filter((item) => procedureFilter === "all" || item.procedureId === procedureFilter)
        .map((item) => ({ id: item.productTypeId, name: item.productType })),
    ),
  )

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
    // Clear previous messages
    setSuccessMessage("")
    setErrorMessage("")
    setIsSubmitting(true)

    try {
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
        const success = await PortfolioService.bulkUpdateStatus(updates)

        if (success) {
          // Show success message
          setSuccessMessage(`Status atualizado com sucesso para ${updates.length} itens`)

          // Reset modified flags
          setEditableData(
            editableData.map((item) => ({
              ...item,
              isModified: false,
              modifiedStatuses: {},
            })),
          )

          // Refresh data
          if (onUpdate) {
            await onUpdate()
          }
        } else {
          setErrorMessage("Erro ao atualizar status. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Error saving status updates:", error)
      setErrorMessage("Erro ao atualizar status. Tente novamente.")
    } finally {
      setIsSubmitting(false)

      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage("")
        }, 3000)
      }
    }
  }

  const getStatusColor = (status: Status | undefined, isModified: boolean | string | undefined) => {
    if (isModified) {
      return "#E5F6FF" // Light blue for modified items
    }
    return status?.color || "#FFFFFF"
  }

  const resetFilters = () => {
    setCountryFilter("all")
    setProcedureFilter("all")
    setProductTypeFilter("all")
    setStatusFilter("all")
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Atualização de Status</h2>

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

      {errorMessage && (
        <Card className="mb-6 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              <p>{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtros</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">País</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Países</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {productTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpar Filtros
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
              <TableHead className="border w-[300px] bg-gray-100">Produto</TableHead>
              <TableHead className="border w-[100px] bg-gray-100">Tier</TableHead>
              <TableHead className="border w-[120px] bg-gray-100">Ciclo de Vida</TableHead>
              {countries.map((country) => (
                <TableHead key={country.id} className="border min-w-[150px] bg-gray-100 text-center">
                  {country.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).length > 0 ? (
              Object.entries(groupedData).flatMap(([category, procedures]) =>
                Object.entries(procedures).flatMap(([procedure, productTypes]) =>
                  Object.entries(productTypes).flatMap(([productType, items]) =>
                    items.map((item) => (
                      <TableRow key={item.id} className={item.isModified ? "bg-blue-50" : ""}>
                        <TableCell className="border">{category}</TableCell>
                        <TableCell className="border">{procedure}</TableCell>
                        <TableCell className="border">{productType}</TableCell>
                        <TableCell className="border">{item.product}</TableCell>
                        <TableCell className="border text-center">{item.productTier}</TableCell>
                        <TableCell className="border text-center">{item.productLifeCycle}</TableCell>
                        {countries.map((country) => {
                          const countryStatus = item.countryStatuses.find((cs) => cs.countryId === country.id)
                          const currentStatusId = countryStatus?.statusId || ""
                          const isModified = item.modifiedStatuses && Boolean(item.modifiedStatuses[country.id])
                          const status = statuses.find((s) => s.id === currentStatusId)

                          return (
                            <TableCell key={`${item.id}-${country.id}`} className="border p-1">
                              <Select
                                value={currentStatusId}
                                onValueChange={(value) => handleStatusChange(item.id, country.id, value)}
                              >
                                <SelectTrigger
                                  className="h-8"
                                  style={{
                                    backgroundColor: getStatusColor(status, isModified),
                                  }}
                                >
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status.id} value={status.id}>
                                      {status.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )),
                  ),
                ),
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6 + countries.length} className="h-24 text-center">
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
        disabled={!editableData.some((item) => item.isModified) || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
