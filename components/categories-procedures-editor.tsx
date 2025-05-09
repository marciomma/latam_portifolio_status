"use client"

import { useState, useEffect } from "react"
import { Check, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioService } from "@/services/portfolio-service"
import type { Category, Procedure, ProductType } from "@/types/database"

interface CategoriesProceduresEditorProps {
  onUpdate?: () => Promise<void>
}

export function CategoriesProceduresEditor({ onUpdate }: CategoriesProceduresEditorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isAddProcedureDialogOpen, setIsAddProcedureDialogOpen] = useState(false)
  const [isAddProductTypeDialogOpen, setIsAddProductTypeDialogOpen] = useState(false)

  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [newProcedure, setNewProcedure] = useState({ name: "", categoryId: "", description: "" })
  const [newProductType, setNewProductType] = useState({ name: "", procedureId: "", description: "" })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const proceduresData = await PortfolioService.getProcedures()
        setProcedures(proceduresData)
        setCategories(
          Array.from(
            new Set(proceduresData.map((proc) => proc.category)),
          ).map((cat) => ({
            id: cat,
            name: cat,
            description: "", // opcional
            isActive: true,
          }))
        )

        const productTypesData = await PortfolioService.getProductTypes()

        setCategories(categories)
        setProcedures(proceduresData)
        setProductTypes(productTypesData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) return

      // In a real app, this would call an API to add the category
      const newCategoryItem = {
        id: `category-${Date.now()}`,
        name: newCategory.name,
        description: newCategory.description,
      }

      setCategories([...categories, newCategoryItem])
      setIsAddCategoryDialogOpen(false)
      setNewCategory({ name: "", description: "" })
      setSuccessMessage("Categoria adicionada com sucesso")

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding category:", err)
      setError("Failed to add category")
    }
  }

  const handleAddProcedure = async () => {
    try {
      if (!newProcedure.name || !newProcedure.categoryId) return

      // In a real app, this would call an API to add the procedure
      const newProcedureItem = {
        id: `procedure-${Date.now()}`,
        name: newProcedure.name,
        category: newProcedure.categoryId,
        description: newProcedure.description,
        isActive: true,
      }

      setProcedures([...procedures, newProcedureItem])
      setIsAddProcedureDialogOpen(false)
      setNewProcedure({ name: "", categoryId: "", description: "" })
      setSuccessMessage("Procedimento adicionado com sucesso")

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding procedure:", err)
      setError("Failed to add procedure")
    }
  }

  const handleAddProductType = async () => {
    try {
      if (!newProductType.name || !newProductType.procedureId) return

      // In a real app, this would call an API to add the product type
      const newProductTypeItem = {
        id: `product-type-${Date.now()}`,
        name: newProductType.name,
        procedureId: newProductType.procedureId,
        description: newProductType.description,
        isActive: true,
      }

      setProductTypes([...productTypes, newProductTypeItem])
      setIsAddProductTypeDialogOpen(false)
      setNewProductType({ name: "", procedureId: "", description: "" })
      setSuccessMessage("Tipo de produto adicionado com sucesso")

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding product type:", err)
      setError("Failed to add product type")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Categorias e Procedimentos</h2>

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

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="product-types">Tipos de Produto</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsAddCategoryDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </div>

          {categories.map((category) => (
            <Card key={category.id} className="mb-4">
              <CardContent className="p-4">
                <h3 className="mb-2 text-lg font-medium">{category.name}</h3>
                {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="procedures">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsAddProcedureDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Procedimento
            </Button>
          </div>

          {procedures.map((procedure) => {
            const category = categories.find((c) => c.id === procedure.category)
            return (
              <Card key={procedure.id} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">{procedure.name}</h3>
                  <p className="mb-2 text-sm">Categoria: {category?.name || "Desconhecida"}</p>
                  {procedure.description && <p className="text-sm text-gray-500">{procedure.description}</p>}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="product-types">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsAddProductTypeDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tipo de Produto
            </Button>
          </div>

          {productTypes.map((productType) => {
            const procedure = procedures.find((p) => p.id === productType.id)
            return (
              <Card key={productType.id} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">{productType.name}</h3>
                  <p className="mb-2 text-sm">Procedimento: {procedure?.name || "Desconhecido"}</p>
                  {productType.description && <p className="text-sm text-gray-500">{productType.description}</p>}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Dialog for adding new category */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding new procedure */}
      <Dialog open={isAddProcedureDialogOpen} onOpenChange={setIsAddProcedureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Procedimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newProcedure.name}
                onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })}
                placeholder="Nome do procedimento"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={newProcedure.categoryId}
                onValueChange={(value) => setNewProcedure({ ...newProcedure, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newProcedure.description}
                onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProcedureDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProcedure}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding new product type */}
      <Dialog open={isAddProductTypeDialogOpen} onOpenChange={setIsAddProductTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Tipo de Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newProductType.name}
                onChange={(e) => setNewProductType({ ...newProductType, name: e.target.value })}
                placeholder="Nome do tipo de produto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Procedimento</label>
              <Select
                value={newProductType.procedureId}
                onValueChange={(value) => setNewProductType({ ...newProductType, procedureId: value })}
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
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newProductType.description}
                onChange={(e) => setNewProductType({ ...newProductType, description: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductTypeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProductType}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
