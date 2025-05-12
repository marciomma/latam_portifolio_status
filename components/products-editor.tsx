"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PortfolioService } from "@/services/portfolio-service"
import type { Procedure, ProductType } from "@/types/database"

interface ProductsEditorProps {
  procedures: Procedure[]
  productTypes: ProductType[]
}

type EditableProduct = {
  id: string
  name: string
  procedureId: string
  productTypeId: string
  productTier: "Tier 1" | "Tier 2"
  productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
}

export function ProductsEditor({ procedures, productTypes }: ProductsEditorProps) {
  const [products, setProducts] = useState<EditableProduct[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState<{
    name: string
    procedureId: string
    productTypeId: string
    productTier: "Tier 1" | "Tier 2"
    productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
  }>({
    name: "",
    procedureId: "",
    productTypeId: "",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [selectAll, setSelectAll] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [procedureFilter, setProcedureFilter] = useState<string>("all")

  // Get unique categories
  const categories = Array.from(new Set(procedures.map((proc) => proc.category)))

  // Get filtered procedures based on category
  const filteredProcedures = procedures.filter((proc) => categoryFilter === "all" || proc.category === categoryFilter)

  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    const productsData = PortfolioService.getProducts()

    const items: EditableProduct[] = productsData.map((product) => ({
      id: product.id,
      name: product.name,
      procedureId: product.procedureId,
      productTypeId: product.productTypeId,
      productTier: product.productTier,
      productLifeCycle: product.productLifeCycle,
      isModified: false,
      isSelected: false,
    }))

    setProducts(items)
  }, [])

  const handleProductNameChange = (productId: string, name: string) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              name,
              isModified: true,
            }
          : product,
      ),
    )
  }

  const handleProcedureChange = (productId: string, procedureId: string) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              procedureId,
              isModified: true,
            }
          : product,
      ),
    )
  }

  const handleProductTypeChange = (productId: string, productTypeId: string) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              productTypeId,
              isModified: true,
            }
          : product,
      ),
    )
  }

  const handleProductTierChange = (productId: string, productTier: "Tier 1" | "Tier 2") => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              productTier,
              isModified: true,
            }
          : product,
      ),
    )
  }

  const handleProductLifeCycleChange = (
    productId: string,
    productLifeCycle: "Maintain" | "Flagship" | "De-emphasize",
  ) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              productLifeCycle,
              isModified: true,
            }
          : product,
      ),
    )
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              isSelected: checked,
            }
          : product,
      ),
    )

    // Update selectAll state
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, isSelected: checked } : product,
    )
    const allSelected = updatedProducts.every((product) => product.isSelected)
    const noneSelected = updatedProducts.every((product) => !product.isSelected)

    setSelectAll(allSelected && !noneSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setProducts(
      products.map((product) => ({
        ...product,
        isSelected: checked,
      })),
    )
  }

  const handleAddNewProduct = () => {
    if (!newProduct.name || !newProduct.procedureId || !newProduct.productTypeId) {
      return
    }

    const newProductItem: EditableProduct = {
      id: `new-${Date.now()}`,
      name: newProduct.name,
      procedureId: newProduct.procedureId,
      productTypeId: newProduct.productTypeId,
      productTier: newProduct.productTier,
      productLifeCycle: newProduct.productLifeCycle,
      isNew: true,
      isModified: true,
      isSelected: false,
    }

    setProducts([...products, newProductItem])
    setIsAddDialogOpen(false)
    setNewProduct({
      name: "",
      procedureId: "",
      productTypeId: "",
      productTier: "Tier 1",
      productLifeCycle: "Maintain",
    })
  }

  const handleDeleteSelected = () => {
    const selectedProducts = products.filter((product) => product.isSelected)
    if (selectedProducts.length === 0) return

    // In a real app, this would call an API to delete the products
    setProducts(products.filter((product) => !product.isSelected))
    setSuccessMessage(`${selectedProducts.length} produto(s) excluído(s) com sucesso`)
    setSelectAll(false)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  const handleSave = () => {
    const modifiedProducts = products.filter((product) => product.isModified)
    if (modifiedProducts.length === 0) return

    // In a real app, this would call an API to save the changes
    // For now, just mark them as not modified
    setProducts(
      products.map((product) => ({
        ...product,
        isModified: false,
        isNew: false,
      })),
    )

    setSuccessMessage(`${modifiedProducts.length} produto(s) salvo(s) com sucesso`)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  // Filter products based on category and procedure
  const filteredProducts = products.filter((product) => {
    const procedure = procedures.find((p) => p.id === product.procedureId)
    if (!procedure) return false

    const matchesCategory = categoryFilter === "all" || procedure.category === categoryFilter
    const matchesProcedure = procedureFilter === "all" || product.procedureId === procedureFilter

    return matchesCategory && matchesProcedure
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cadastro de Produtos</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDeleteSelected}
            disabled={!products.some((product) => product.isSelected)}
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

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Procedimento</label>
              <Select value={procedureFilter} onValueChange={setProcedureFilter}>
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
        </CardContent>
      </Card>

      <div className="mb-6 overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" />
              </TableHead>
              <TableHead className="w-[150px]">Procedimento</TableHead>
              <TableHead className="w-[150px]">Tipo de Produto</TableHead>
              <TableHead className="w-[300px]">Nome do Produto</TableHead>
              <TableHead className="w-[100px]">Tier</TableHead>
              <TableHead className="w-[150px]">Ciclo de Vida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const procedure = procedures.find((p) => p.id === product.procedureId)
                const productType = productTypes.find((pt) => pt.id === product.productTypeId)

                return (
                  <TableRow
                    key={product.id}
                    className={product.isNew ? "bg-blue-50" : product.isModified ? "bg-yellow-50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={product.isSelected}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                        aria-label="Selecionar produto"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={product.procedureId}
                        onValueChange={(value) => handleProcedureChange(product.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {procedures.map((procedure) => (
                            <SelectItem key={procedure.id} value={procedure.id}>
                              {procedure.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={product.productTypeId}
                        onValueChange={(value) => handleProductTypeChange(product.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={product.name}
                        onChange={(e) => handleProductNameChange(product.id, e.target.value)}
                        placeholder="Nome do produto"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={product.productTier}
                        onValueChange={(value) => handleProductTierChange(product.id, value as "Tier 1" | "Tier 2")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tier 1">Tier 1</SelectItem>
                          <SelectItem value="Tier 2">Tier 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={product.productLifeCycle}
                        onValueChange={(value) =>
                          handleProductLifeCycleChange(product.id, value as "Maintain" | "Flagship" | "De-emphasize")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ciclo de vida" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintain">Maintain</SelectItem>
                          <SelectItem value="Flagship">Flagship</SelectItem>
                          <SelectItem value="De-emphasize">De-emphasize</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum produto encontrado. Adicione novos produtos usando o botão acima ou ajuste seus filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {products.some((product) => product.isModified) && (
        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      )}

      {/* Dialog for adding new product */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Procedimento</label>
              <Select
                value={newProduct.procedureId}
                onValueChange={(value) => setNewProduct({ ...newProduct, procedureId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um procedimento" />
                </SelectTrigger>
                <SelectContent>
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
              <Select
                value={newProduct.productTypeId}
                onValueChange={(value) => setNewProduct({ ...newProduct, productTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Produto</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Digite o nome do produto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <Select
                value={newProduct.productTier}
                onValueChange={(value) => setNewProduct({ ...newProduct, productTier: value as "Tier 1" | "Tier 2" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier 1">Tier 1</SelectItem>
                  <SelectItem value="Tier 2">Tier 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciclo de Vida</label>
              <Select
                value={newProduct.productLifeCycle}
                onValueChange={(value) =>
                  setNewProduct({
                    ...newProduct,
                    productLifeCycle: value as "Maintain" | "Flagship" | "De-emphasize",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ciclo de vida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintain">Maintain</SelectItem>
                  <SelectItem value="Flagship">Flagship</SelectItem>
                  <SelectItem value="De-emphasize">De-emphasize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewProduct}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
