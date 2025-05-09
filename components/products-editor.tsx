"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PortfolioService } from "@/services/portfolio-service"
import type { Procedure, ProductType } from "@/types/database"

interface Product {
  id: string
  name: string
  productTypeId: string
  procedureId: string
  productTier: "Tier 1" | "Tier 2"
  productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
  description?: string
  isActive: boolean
}

interface ProductsEditorProps {
  procedures: Procedure[]
  productTypes: ProductType[]
  onUpdate?: () => Promise<void>
}

export const ProductsEditor: React.FC<ProductsEditorProps> = ({ procedures, productTypes, onUpdate }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<{
    name: string
    productTypeId: string
    procedureId: string
    productTier: "Tier 1" | "Tier 2"
    productLifeCycle: "Maintain" | "Flagship" | "De-emphasize"
    description?: string
    isActive: boolean
  }>({
    name: "",
    productTypeId: "",
    procedureId: "",
    productTier: "Tier 1",
    productLifeCycle: "Maintain",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    // Fetch products from PortfolioService
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const initialProducts = await PortfolioService.getProducts()
        setProducts(initialProducts)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddProduct = async () => {
    try {
      const newProductItem: Product = {
        id: `new-product-${Date.now()}`,
        name: newProduct.name,
        productTypeId: newProduct.productTypeId,
        procedureId: newProduct.procedureId,
        productTier: newProduct.productTier,
        productLifeCycle: newProduct.productLifeCycle,
        description: newProduct.description,
        isActive: newProduct.isActive,
      }

      setProducts([...products, newProductItem])
      setIsAddDialogOpen(false)
      setNewProduct({
        name: "",
        productTypeId: "",
        procedureId: "",
        productTier: "Tier 1",
        productLifeCycle: "Maintain",
        description: "",
        isActive: true,
      })

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Failed to add product")
    }
  }

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const updatedProducts = products.map((product) =>
        product.id === id ? { ...product, ...updatedProduct } : product,
      )
      setProducts(updatedProducts)

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Failed to update product")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product")
    }
  }

  const handleSaveProducts = async () => {
    try {
      // In a real app, this would call an API to save the changes
      console.log("Saving products:", products)

      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate()
      }
    } catch (err) {
      console.error("Error saving products:", err)
      setError("Failed to save products")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Carregando produtos...</span>
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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium">Products</h3>
        <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
          Add Product
        </Button>
      </div>
      {products.map((product) => (
        <Card key={product.id} className="mb-4">
          <CardContent>
            <Input
              type="text"
              value={product.name}
              onChange={(e) => handleUpdateProduct(product.id, { name: e.target.value })}
              placeholder="Product Name"
            />
            <Select
              value={product.productTypeId}
              onValueChange={(value) => handleUpdateProduct(product.id, { productTypeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Product Type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={product.procedureId}
              onValueChange={(value) => handleUpdateProduct(product.id, { procedureId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Procedure" />
              </SelectTrigger>
              <SelectContent>
                {procedures.map((procedure) => (
                  <SelectItem key={procedure.id} value={procedure.id}>
                    {procedure.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleSaveProducts}>Save Products</Button>

      {/* Dialog for adding new product */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Type</label>
              <Select
                value={newProduct.productTypeId}
                onValueChange={(value) => setNewProduct({ ...newProduct, productTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product Type" />
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
              <label className="text-sm font-medium">Procedure</label>
              <Select
                value={newProduct.procedureId}
                onValueChange={(value) => setNewProduct({ ...newProduct, procedureId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Procedure" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
