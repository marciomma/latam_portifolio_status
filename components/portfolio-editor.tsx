"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PortfolioService } from "@/services/portfolio-service"
import { useUpdateStatus } from "@/hooks/usePortfolioData"
import type { Country, Product, Status } from "@/types/database"

interface PortfolioEditorProps {
  countries: Country[]
  products: Product[]
  statuses: Status[]
  onDataUpdate?: () => void // Callback to refresh parent data
}

type EditablePortfolioItem = {
  id: string
  productId: string
  productName: string
  countryId: string
  statusId: string
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
}

export function PortfolioEditor({ countries, products, statuses, onDataUpdate }: PortfolioEditorProps) {
  const [portfolioItems, setPortfolioItems] = useState<EditablePortfolioItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({ productId: "", countryId: "", statusId: "" })
  const [successMessage, setSuccessMessage] = useState("")
  const [selectAll, setSelectAll] = useState(false)
  
  // Use our custom hook for updates
  const { updateStatus, isUpdating } = useUpdateStatus()

  useEffect(() => {
    const loadData = async () => {
      const statusPortfolios = await PortfolioService.getStatusPortfolios()

      const items: EditablePortfolioItem[] = statusPortfolios.map((sp) => {
        const product = products.find((p) => p.id === sp.productId)
        return {
          id: sp.id,
          productId: sp.productId,
          productName: product?.name || "Produto Desconhecido",
          countryId: sp.countryId,
          statusId: sp.statusId,
          isModified: false,
          isSelected: false,
        }
      })

      setPortfolioItems(items)
    }

    loadData()
  }, [products])

  const handleStatusChange = (itemId: string, statusId: string) => {
    setPortfolioItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, statusId, isModified: true } : item
      )
    )
  }

  const handleCountryChange = (itemId: string, countryId: string) => {
    setPortfolioItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, countryId, isModified: true } : item
      )
    )
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const updated = portfolioItems.map((item) =>
      item.id === itemId ? { ...item, isSelected: checked } : item
    )

    setPortfolioItems(updated)

    const allSelected = updated.every((item) => item.isSelected)
    const noneSelected = updated.every((item) => !item.isSelected)
    setSelectAll(allSelected && !noneSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setPortfolioItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: checked }))
    )
  }

  const handleAddNewItem = () => {
    if (!newItem.productId || !newItem.countryId || !newItem.statusId) return

    const product = products.find((p) => p.id === newItem.productId)

    const newPortfolioItem: EditablePortfolioItem = {
      id: `new-${Date.now()}`,
      productId: newItem.productId,
      productName: product?.name || "Produto Desconhecido",
      countryId: newItem.countryId,
      statusId: newItem.statusId,
      isNew: true,
      isModified: true,
      isSelected: false,
    }

    setPortfolioItems([...portfolioItems, newPortfolioItem])
    setIsAddDialogOpen(false)
    setNewItem({ productId: "", countryId: "", statusId: "" })
  }

  const handleDeleteSelected = () => {
    const selectedItems = portfolioItems.filter((item) => item.isSelected)
    if (selectedItems.length === 0) return

    setPortfolioItems(portfolioItems.filter((item) => !item.isSelected))
    setSuccessMessage(`${selectedItems.length} registro(s) excluído(s) com sucesso`)
    setSelectAll(false)

    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleSave = async () => {
    const modifiedItems = portfolioItems.filter((item) => item.isModified)
    if (modifiedItems.length === 0) return

    try {
      // Prepare updates in the expected API format
      const updates = modifiedItems.map(item => ({
        productId: item.productId,
        countryId: item.countryId,
        statusId: item.statusId
      }));
      
      // Use our custom hook for updating
      const result = await updateStatus(updates);
      console.log('Update result:', result);
      
      // Mark all items as unmodified
      setPortfolioItems((prev) =>
        prev.map((item) => ({
          ...item,
          isModified: false,
          isNew: false,
        }))
      )

      // Show success message
      setSuccessMessage(`${modifiedItems.length} registro(s) salvo(s) com sucesso`)
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
      
      // Notify parent to refresh data if callback provided
      if (onDataUpdate) {
        onDataUpdate()
      }
      
      // Refresh local data
      const statusPortfolios = await PortfolioService.getStatusPortfolios()
      const items: EditablePortfolioItem[] = statusPortfolios.map((sp) => {
        const product = products.find((p) => p.id === sp.productId)
        return {
          id: sp.id,
          productId: sp.productId,
          productName: product?.name || "Produto Desconhecido",
          countryId: sp.countryId,
          statusId: sp.statusId,
          isModified: false,
          isSelected: false,
        }
      })
      setPortfolioItems(items)
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setSuccessMessage(`Erro ao salvar: ${error instanceof Error ? error.message : String(error)}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Editor de Portfolio</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Inserir Novos Registros
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={!portfolioItems.some((item) => item.isSelected)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir Selecionados
          </Button>
        </div>
      </div>

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

      <div className="mb-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
              </TableHead>
              <TableHead className="w-[300px]">Nome do Produto</TableHead>
              <TableHead className="w-[200px]">País</TableHead>
              <TableHead className="w-[200px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolioItems.length > 0 ? (
              portfolioItems.map((item) => (
                <TableRow key={item.id} className={item.isNew ? "bg-blue-50" : item.isModified ? "bg-yellow-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={item.isSelected}
                      onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    <Select value={item.countryId} onValueChange={(value) => handleCountryChange(item.id, value)}>
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
                  </TableCell>
                  <TableCell>
                    <Select value={item.statusId} onValueChange={(value) => handleStatusChange(item.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum registro encontrado. Adicione novos registros usando o botão acima.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {portfolioItems.some((item) => item.isModified) && (
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={isUpdating}
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
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Registro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <Select value={newItem.productId} onValueChange={(value) => setNewItem({ ...newItem, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">País</label>
              <Select value={newItem.countryId} onValueChange={(value) => setNewItem({ ...newItem, countryId: value })}>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newItem.statusId} onValueChange={(value) => setNewItem({ ...newItem, statusId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewItem}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
