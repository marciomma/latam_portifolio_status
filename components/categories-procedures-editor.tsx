"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, ChevronRight, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PortfolioService } from "@/services/portfolio-service"

type EditableCategory = {
  id: string
  name: string
  description?: string
  isActive: boolean
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
  isExpanded?: boolean
}

type EditableProcedure = {
  id: string
  name: string
  category: string
  description?: string
  isActive: boolean
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
}

export function CategoriesProceduresEditor() {
  // State for Categories
  const [categories, setCategories] = useState<EditableCategory[]>([])
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<{ name: string; description: string; isActive: boolean }>({
    name: "",
    description: "",
    isActive: true,
  })
  const [selectAllCategories, setSelectAllCategories] = useState(false)
  const [categorySuccessMessage, setCategorySuccessMessage] = useState("")

  // State for Procedures
  const [procedures, setProcedures] = useState<EditableProcedure[]>([])
  const [isAddProcedureDialogOpen, setIsAddProcedureDialogOpen] = useState(false)
  const [newProcedure, setNewProcedure] = useState<{
    name: string
    category: string
    description: string
    isActive: boolean
  }>({
    name: "",
    category: "",
    description: "",
    isActive: true,
  })
  const [selectAllProcedures, setSelectAllProcedures] = useState(false)
  const [procedureSuccessMessage, setProcedureSuccessMessage] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll extract unique categories from procedures
    const proceduresData = PortfolioService.getProcedures()
    const uniqueCategories = Array.from(new Set(proceduresData.map((proc) => proc.category)))

    const categoriesData: EditableCategory[] = uniqueCategories.map((category, index) => ({
      id: `category-${index + 1}`,
      name: category,
      description: `Description for ${category}`,
      isActive: true,
      isModified: false,
      isSelected: false,
      isExpanded: false,
    }))

    const proceduresData2: EditableProcedure[] = proceduresData.map((procedure) => ({
      id: procedure.id,
      name: procedure.name,
      category: procedure.category,
      description: procedure.description || "",
      isActive: procedure.isActive,
      isModified: false,
      isSelected: false,
    }))

    setCategories(categoriesData)
    setProcedures(proceduresData2)
  }, [])

  // Category Functions
  const handleCategoryNameChange = (categoryId: string, name: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              name,
              isModified: true,
            }
          : category,
      ),
    )
  }

  const handleCategoryDescriptionChange = (categoryId: string, description: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              description,
              isModified: true,
            }
          : category,
      ),
    )
  }

  const handleCategoryActiveChange = (categoryId: string, isActive: boolean) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              isActive,
              isModified: true,
            }
          : category,
      ),
    )
  }

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              isSelected: checked,
            }
          : category,
      ),
    )

    // Update selectAll state
    const updatedCategories = categories.map((category) =>
      category.id === categoryId ? { ...category, isSelected: checked } : category,
    )
    const allSelected = updatedCategories.every((category) => category.isSelected)
    const noneSelected = updatedCategories.every((category) => !category.isSelected)

    setSelectAllCategories(allSelected && !noneSelected)
  }

  const handleSelectAllCategories = (checked: boolean) => {
    setSelectAllCategories(checked)
    setCategories(
      categories.map((category) => ({
        ...category,
        isSelected: checked,
      })),
    )
  }

  const handleToggleCategoryExpand = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              isExpanded: !category.isExpanded,
            }
          : category,
      ),
    )
  }

  const handleAddNewCategory = () => {
    if (!newCategory.name) {
      return
    }

    const newCategoryItem: EditableCategory = {
      id: `new-category-${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      isActive: newCategory.isActive,
      isNew: true,
      isModified: true,
      isSelected: false,
      isExpanded: false,
    }

    setCategories([...categories, newCategoryItem])
    setIsAddCategoryDialogOpen(false)
    setNewCategory({
      name: "",
      description: "",
      isActive: true,
    })
  }

  const handleDeleteSelectedCategories = () => {
    const selectedCategories = categories.filter((category) => category.isSelected)
    if (selectedCategories.length === 0) return

    // In a real app, this would call an API to delete the categories
    // Also need to handle related procedures
    setCategories(categories.filter((category) => !category.isSelected))
    setCategorySuccessMessage(`${selectedCategories.length} categoria(s) excluída(s) com sucesso`)
    setSelectAllCategories(false)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setCategorySuccessMessage("")
    }, 3000)
  }

  const handleSaveCategories = () => {
    const modifiedCategories = categories.filter((category) => category.isModified)
    if (modifiedCategories.length === 0) return

    // In a real app, this would call an API to save the changes
    // For now, just mark them as not modified
    setCategories(
      categories.map((category) => ({
        ...category,
        isModified: false,
        isNew: false,
      })),
    )

    setCategorySuccessMessage(`${modifiedCategories.length} categoria(s) salva(s) com sucesso`)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setCategorySuccessMessage("")
    }, 3000)
  }

  // Procedure Functions
  const handleProcedureNameChange = (procedureId: string, name: string) => {
    setProcedures(
      procedures.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              name,
              isModified: true,
            }
          : procedure,
      ),
    )
  }

  const handleProcedureCategoryChange = (procedureId: string, category: string) => {
    setProcedures(
      procedures.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              category,
              isModified: true,
            }
          : procedure,
      ),
    )
  }

  const handleProcedureDescriptionChange = (procedureId: string, description: string) => {
    setProcedures(
      procedures.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              description,
              isModified: true,
            }
          : procedure,
      ),
    )
  }

  const handleProcedureActiveChange = (procedureId: string, isActive: boolean) => {
    setProcedures(
      procedures.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              isActive,
              isModified: true,
            }
          : procedure,
      ),
    )
  }

  const handleSelectProcedure = (procedureId: string, checked: boolean) => {
    setProcedures(
      procedures.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              isSelected: checked,
            }
          : procedure,
      ),
    )

    // Update selectAll state
    const updatedProcedures = procedures.map((procedure) =>
      procedure.id === procedureId ? { ...procedure, isSelected: checked } : procedure,
    )
    const allSelected = updatedProcedures.every((procedure) => procedure.isSelected)
    const noneSelected = updatedProcedures.every((procedure) => !procedure.isSelected)

    setSelectAllProcedures(allSelected && !noneSelected)
  }

  const handleSelectAllProcedures = (checked: boolean) => {
    setSelectAllProcedures(checked)
    setProcedures(
      procedures.map((procedure) => ({
        ...procedure,
        isSelected: checked,
      })),
    )
  }

  const handleAddNewProcedure = () => {
    if (!newProcedure.name || !newProcedure.category) {
      return
    }

    const newProcedureItem: EditableProcedure = {
      id: `new-procedure-${Date.now()}`,
      name: newProcedure.name,
      category: newProcedure.category,
      description: newProcedure.description,
      isActive: newProcedure.isActive,
      isNew: true,
      isModified: true,
      isSelected: false,
    }

    setProcedures([...procedures, newProcedureItem])
    setIsAddProcedureDialogOpen(false)
    setNewProcedure({
      name: "",
      category: "",
      description: "",
      isActive: true,
    })
  }

  const handleDeleteSelectedProcedures = () => {
    const selectedProcedures = procedures.filter((procedure) => procedure.isSelected)
    if (selectedProcedures.length === 0) return

    // In a real app, this would call an API to delete the procedures
    setProcedures(procedures.filter((procedure) => !procedure.isSelected))
    setProcedureSuccessMessage(`${selectedProcedures.length} procedimento(s) excluído(s) com sucesso`)
    setSelectAllProcedures(false)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setProcedureSuccessMessage("")
    }, 3000)
  }

  const handleSaveProcedures = () => {
    const modifiedProcedures = procedures.filter((procedure) => procedure.isModified)
    if (modifiedProcedures.length === 0) return

    // In a real app, this would call an API to save the changes
    // For now, just mark them as not modified
    setProcedures(
      procedures.map((procedure) => ({
        ...procedure,
        isModified: false,
        isNew: false,
      })),
    )

    setProcedureSuccessMessage(`${modifiedProcedures.length} procedimento(s) salvo(s) com sucesso`)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setProcedureSuccessMessage("")
    }, 3000)
  }

  // Filter procedures based on category
  const filteredProcedures = procedures.filter(
    (procedure) => categoryFilter === "all" || procedure.category === categoryFilter,
  )

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Gerenciamento de Categorias e Procedimentos</h2>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium">Categorias</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsAddCategoryDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleDeleteSelectedCategories}
                disabled={!categories.some((category) => category.isSelected)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir Selecionadas
              </Button>
            </div>
          </div>

          {categorySuccessMessage && (
            <Card className="mb-6 border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <p>{categorySuccessMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-6 overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectAllCategories}
                      onCheckedChange={handleSelectAllCategories}
                      aria-label="Selecionar todas"
                    />
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[300px]">Nome da Categoria</TableHead>
                  <TableHead className="w-[400px]">Descrição</TableHead>
                  <TableHead className="w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow
                      key={category.id}
                      className={category.isNew ? "bg-blue-50" : category.isModified ? "bg-yellow-50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={category.isSelected}
                          onCheckedChange={(checked) => handleSelectCategory(category.id, !!checked)}
                          aria-label="Selecionar categoria"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleToggleCategoryExpand(category.id)}
                        >
                          {category.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={category.name}
                          onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                          placeholder="Nome da categoria"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={category.description || ""}
                          onChange={(e) => handleCategoryDescriptionChange(category.id, e.target.value)}
                          placeholder="Descrição da categoria"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={category.isActive}
                          onCheckedChange={(checked) => handleCategoryActiveChange(category.id, !!checked)}
                          aria-label="Categoria ativa"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma categoria encontrada. Adicione novas categorias usando o botão acima.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {categories.some((category) => category.isModified) && (
            <Button onClick={handleSaveCategories} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          )}

          {/* Dialog for adding new category */}
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Categoria</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Digite o nome da categoria"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Digite a descrição da categoria"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-active"
                    checked={newCategory.isActive}
                    onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: !!checked })}
                  />
                  <label htmlFor="category-active" className="text-sm font-medium">
                    Categoria Ativa
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNewCategory}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium">Procedimentos</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsAddProcedureDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Novo Procedimento
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleDeleteSelectedProcedures}
                disabled={!procedures.some((procedure) => procedure.isSelected)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir Selecionados
              </Button>
            </div>
          </div>

          {procedureSuccessMessage && (
            <Card className="mb-6 border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <p>{procedureSuccessMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Categoria</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
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
                    <Checkbox
                      checked={selectAllProcedures}
                      onCheckedChange={handleSelectAllProcedures}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-[200px]">Categoria</TableHead>
                  <TableHead className="w-[300px]">Nome do Procedimento</TableHead>
                  <TableHead className="w-[400px]">Descrição</TableHead>
                  <TableHead className="w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcedures.length > 0 ? (
                  filteredProcedures.map((procedure) => (
                    <TableRow
                      key={procedure.id}
                      className={procedure.isNew ? "bg-blue-50" : procedure.isModified ? "bg-yellow-50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={procedure.isSelected}
                          onCheckedChange={(checked) => handleSelectProcedure(procedure.id, !!checked)}
                          aria-label="Selecionar procedimento"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={procedure.category}
                          onValueChange={(value) => handleProcedureCategoryChange(procedure.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={procedure.name}
                          onChange={(e) => handleProcedureNameChange(procedure.id, e.target.value)}
                          placeholder="Nome do procedimento"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={procedure.description || ""}
                          onChange={(e) => handleProcedureDescriptionChange(procedure.id, e.target.value)}
                          placeholder="Descrição do procedimento"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={procedure.isActive}
                          onCheckedChange={(checked) => handleProcedureActiveChange(procedure.id, !!checked)}
                          aria-label="Procedimento ativo"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum procedimento encontrado. Adicione novos procedimentos usando o botão acima ou ajuste seus
                      filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {procedures.some((procedure) => procedure.isModified) && (
            <Button onClick={handleSaveProcedures} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          )}

          {/* Dialog for adding new procedure */}
          <Dialog open={isAddProcedureDialogOpen} onOpenChange={setIsAddProcedureDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Procedimento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={newProcedure.category}
                    onValueChange={(value) => setNewProcedure({ ...newProcedure, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Procedimento</label>
                  <Input
                    value={newProcedure.name}
                    onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })}
                    placeholder="Digite o nome do procedimento"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newProcedure.description}
                    onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                    placeholder="Digite a descrição do procedimento"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="procedure-active"
                    checked={newProcedure.isActive}
                    onCheckedChange={(checked) => setNewProcedure({ ...newProcedure, isActive: !!checked })}
                  />
                  <label htmlFor="procedure-active" className="text-sm font-medium">
                    Procedimento Ativo
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProcedureDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNewProcedure}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
