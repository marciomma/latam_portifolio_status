"use client";

import React, { useState, useEffect } from "react"
import { Check, Plus, Save, Trash2, ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Procedure, ProductType, Product } from "@/types/database"

interface ProductsEditorProps {
  procedures: Procedure[]
  productTypes: ProductType[]
}

// Extend Product type for UI state
type EditableProduct = Product & {
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
}

export function ProductsEditor({ procedures, productTypes }: ProductsEditorProps) {
  const [products, setProducts] = useState<EditableProduct[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [procedureFilter, setProcedureFilter] = useState<string>("all")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: 'name',
    direction: 'ascending'
  });

  const categories = Array.from(new Set(procedures.map((proc) => proc.category)))
  const filteredProcedures = procedures.filter(
    (proc) => categoryFilter === "all" || proc.category === categoryFilter
  )

  // Função para carregar produtos - FIXED to use API route
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log("Loading products...");
      
      // Fetch from API route instead of directly accessing Redis
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status}`);
      }
      
      const productsData = await response.json();
      console.log(`Loaded ${productsData.length} products`);
      
      const items: EditableProduct[] = productsData.map((product: Product) => ({
        ...product,
        isModified: false,
        isSelected: false,
      }));
      
      // Ordenar os produtos carregados
      const sortedItems = sortProducts(items);
      setProducts(sortedItems);
      
      if (productsData.length === 0) {
        setErrorMessage("No products found. Add your first product.");
        setTimeout(() => setErrorMessage(""), 5000);
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setErrorMessage(`Error loading products: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos na montagem do componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Função para ordenar produtos
  const sortProducts = (productsToSort: EditableProduct[]) => {
    return [...productsToSort].sort((a, b) => {
      // 1. Comparar por nome do procedimento
      const procedureA = procedures.find(p => p.id === a.procedureId)?.name || '';
      const procedureB = procedures.find(p => p.id === b.procedureId)?.name || '';
      const procedureComparison = procedureA.localeCompare(procedureB);
      
      if (procedureComparison !== 0) return procedureComparison;
      
      // 2. Comparar por tipo de produto
      const productTypeA = productTypes.find(pt => pt.id === a.productTypeId)?.name || '';
      const productTypeB = productTypes.find(pt => pt.id === b.productTypeId)?.name || '';
      const productTypeComparison = productTypeA.localeCompare(productTypeB);
      
      if (productTypeComparison !== 0) return productTypeComparison;
      
      // 3. Comparar por nome do produto
      return a.name.localeCompare(b.name);
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      // Filtrar apenas produtos modificados ou novos
      const productsToSave = products.filter(p => p.isModified || p.isNew);
      
      if (productsToSave.length === 0) {
        setSuccessMessage("No changes to save.");
        return;
      }
      
      console.log(`Sending ${productsToSave.length} products to save`);
      
      // Verificar se há campos em branco
      const invalidProducts = productsToSave.filter(
        p => !p.name || !p.procedureId || !p.productTypeId
      );
      
      if (invalidProducts.length > 0) {
        // Identificar quais campos estão faltando
        const missingFields: string[] = [];
        
        invalidProducts.forEach(product => {
          const fields = [];
          if (!product.name) fields.push("Product Name");
          if (!product.procedureId) fields.push("Procedure");
          if (!product.productTypeId) fields.push("Product Type");
          
          missingFields.push(`Product ${product.name || "(no name)"}: ${fields.join(", ")}`);
        });
        
        setErrorMessage(`Cannot save. The following fields are required: ${missingFields.join("; ")}`);
        return;
      }
      
      // Verificar duplicidade de nomes
      const names = productsToSave.map(p => p.name.trim().toLowerCase());
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      
      if (duplicateNames.length > 0) {
        setErrorMessage(`There are duplicate names among products: ${[...new Set(duplicateNames)].join(', ')}`);
        return;
      }
      
      // Usar o endpoint de debug para salvar pois tem melhor tratamento de erro
      const response = await fetch('/api/debug/products/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: productsToSave.map(p => ({
            id: p.id,
            name: p.name,
            procedureId: p.procedureId,
            productTypeId: p.productTypeId,
            productTier: p.productTier,
            productLifeCycle: p.productLifeCycle,
            isActive: p.isActive === undefined ? true : p.isActive
          }))
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error saving products');
      }
      
      if (result.success) {
        // Recarregar dados para garantir consistência
        await loadProducts();
        setSuccessMessage(`${productsToSave.length} products saved successfully! Total of ${result.totalProducts} products in database.`);
      } else {
        throw new Error(result.message || 'Unknown error saving products');
      }
    } catch (error) {
      console.error('Error saving products:', error);
      setErrorMessage(`Error saving: ${error instanceof Error ? error.message : String(error)}`);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  }

  // Função para alterar valores do produto
  const handleProductChange = (productId: string, field: keyof EditableProduct, value: string | boolean) => {
    // Verificação especial para o campo 'name' para evitar duplicidade
    if (field === 'name') {
      // Converter para maiúsculas
      value = String(value).toUpperCase();
      
      const lowerCaseValue = value.trim().toLowerCase();
      
      // Checar se já existe outro produto com esse nome
      const duplicateProduct = products.find(p => 
        p.id !== productId && p.name.trim().toLowerCase() === lowerCaseValue
      );
      
      if (duplicateProduct) {
        setErrorMessage(`Duplicate name: "${value}" is already being used by another product.`);
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
    }
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, [field]: value, isModified: true } 
          : product
      )
    );
  };

  // Função para selecionar/deselecionar produto
  const handleSelectProduct = (productId: string, selected: boolean) => {
    setSelectedProducts(prev => 
      selected 
        ? [...prev, productId] 
        : prev.filter(id => id !== productId)
    );
  };

  // Função para adicionar um novo produto na tabela
  const handleAddProduct = () => {
    const productId = `product-${Date.now()}`;
    
    // Criar um produto vazio
    const newProductItem: EditableProduct = {
      id: productId,
      name: "",
      procedureId: "",
      productTypeId: "",
      productTier: "Tier 1" as "Tier 1" | "Tier 2",
      productLifeCycle: "Maintain" as "Maintain" | "Flagship" | "De-emphasize",
      isActive: true,
      isNew: true,
      isModified: true,
      isSelected: false
    };

    // Adicionar ao início da lista de produtos
    setProducts(prev => [newProductItem, ...prev]);
    
    // Mostrar mensagem
    setSuccessMessage("New row added. Fill in all fields and save to complete.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Função para excluir produtos selecionados
  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      setLoading(true);
      // Chamar a API para excluir produtos
      const response = await fetch(`/api/products?ids=${selectedProducts.join(',')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Deletion result:', result);
      
      // Remover produtos do estado local
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      
      // Mostrar mensagem de sucesso
      setSuccessMessage(`${selectedProducts.length} product(s) deleted successfully!`);
      
      // Recarregar dados para garantir consistência
      await loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      setErrorMessage(`Error deleting: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar produtos baseados nos filtros selecionados
  const filteredProducts = products.filter(product => {
    const productProcedure = procedures.find(p => p.id === product.procedureId);
    
    return (categoryFilter === "all" || productProcedure?.category === categoryFilter) &&
           (procedureFilter === "all" || product.procedureId === procedureFilter);
  });

  // Função para alternar a ordenação
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  // Função auxiliar para exibir ícone de ordenação
  const getSortIcon = (columnName: string) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-4 w-4 inline ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  // Aplicar ordenação aos produtos filtrados
  const sortedProducts = React.useMemo(() => {
    if (sortConfig.direction === null) {
      return filteredProducts;
    }

    const sortableProducts = [...filteredProducts];
    sortableProducts.sort((a, b) => {
      switch(sortConfig.key) {
        case 'name':
          return sortConfig.direction === 'ascending' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        
        case 'procedure':
          const procedureA = procedures.find(p => p.id === a.procedureId)?.name || '';
          const procedureB = procedures.find(p => p.id === b.procedureId)?.name || '';
          return sortConfig.direction === 'ascending' 
            ? procedureA.localeCompare(procedureB)
            : procedureB.localeCompare(procedureA);
        
        case 'productType':
          const productTypeA = productTypes.find(pt => pt.id === a.productTypeId)?.name || '';
          const productTypeB = productTypes.find(pt => pt.id === b.productTypeId)?.name || '';
          return sortConfig.direction === 'ascending' 
            ? productTypeA.localeCompare(productTypeB)
            : productTypeB.localeCompare(productTypeA);
        
        case 'tier':
          return sortConfig.direction === 'ascending' 
            ? a.productTier.localeCompare(b.productTier)
            : b.productTier.localeCompare(a.productTier);
        
        case 'lifecycle':
          return sortConfig.direction === 'ascending' 
            ? a.productLifeCycle.localeCompare(b.productLifeCycle)
            : b.productLifeCycle.localeCompare(a.productLifeCycle);
        
        default:
          return 0;
      }
    });
    return sortableProducts;
  }, [filteredProducts, sortConfig, procedures, productTypes]);

  // Verificar se todos os produtos ordenados estão selecionados
  const allSelected = sortedProducts.length > 0 && 
                     sortedProducts.every(product => selectedProducts.includes(product.id));

  // Função para selecionar/deselecionar todos os produtos
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const sortedProductIds = sortedProducts
        .map(product => product.id);
      
      setSelectedProducts(sortedProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  return (
    <div>
      <div className="mt-6 mb-6 flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddProduct} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
            disabled={selectedProducts.length === 0 || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          {(products.some((item) => item.isModified) || products.some((item) => item.isNew)) && (
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
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

      {errorMessage && (
        <Card className="mb-6 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <p>{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="mb-6 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <p>Loading data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={procedureFilter} onValueChange={setProcedureFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by procedure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Procedures</SelectItem>
              {filteredProcedures
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
      </div>

      <div className="mb-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={allSelected && sortedProducts.length > 0} 
                  onCheckedChange={handleSelectAll}
                  disabled={sortedProducts.length === 0}
                />
              </TableHead>
              <TableHead 
                className="w-[300px] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('name')}
              >
                Product Name {getSortIcon('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('procedure')}
              >
                Procedure {getSortIcon('procedure')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('productType')}
              >
                Product Type {getSortIcon('productType')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('tier')}
              >
                Tier {getSortIcon('tier')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('lifecycle')}
              >
                Life Cycle {getSortIcon('lifecycle')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => {
                // These variables were found for future use but aren't currently needed
                // const procedure = procedures.find(p => p.id === product.procedureId);
                // const productType = productTypes.find(pt => pt.id === product.productTypeId);
                
                return (
                  <TableRow 
                    key={product.id}
                    className={product.isNew ? "bg-blue-50" : product.isModified ? "bg-yellow-50" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedProducts.includes(product.id)} 
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={product.name} 
                        onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={product.procedureId} 
                        onValueChange={(value) => handleProductChange(product.id, 'procedureId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
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
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={product.productTypeId} 
                        onValueChange={(value) => handleProductChange(product.id, 'productTypeId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={product.productTier} 
                        onValueChange={(value) => handleProductChange(product.id, 'productTier', value as "Tier 1" | "Tier 2")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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
                        onValueChange={(value) => handleProductChange(product.id, 'productLifeCycle', value as "Maintain" | "Flagship" | "De-emphasize")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintain">Maintain</SelectItem>
                          <SelectItem value="Flagship">Flagship</SelectItem>
                          <SelectItem value="De-emphasize">De-emphasize</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found. Try adjusting the filters or add a new product.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
