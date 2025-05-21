"use client"

import { useState, useEffect } from "react"
import { CountryEditor } from "@/components/country-editor"
import { PortfolioService } from "@/services/portfolio-service"
import { Country, Product, PortfolioStatusView, Procedure, ProductType, Status } from "@/types/database"

export default function CountryStatusPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioStatusView[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Carregar todos os dados necessários
        const [
          portfolioData,
          countries,
          procedures,
          statuses,
          products,
          productTypes
        ] = await Promise.all([
          PortfolioService.getPortfolioStatusView(),
          PortfolioService.getCountries(),
          PortfolioService.getProcedures(),
          PortfolioService.getStatuses(),
          PortfolioService.getProducts(),
          PortfolioService.getProductTypes()
        ])
        
        setPortfolioData(portfolioData)
        setCountries(countries)
        setProcedures(procedures)
        setStatuses(statuses)
        setProducts(products)
        setProductTypes(productTypes)
        
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Falha ao carregar dados. Por favor, tente novamente.")
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Função de callback quando a edição é salva
  const handleSaveComplete = async () => {
    try {
      const updatedData = await PortfolioService.getPortfolioStatusView()
      setPortfolioData(updatedData)
    } catch (err) {
      console.error("Erro ao atualizar dados após salvar:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-lg border border-destructive p-8 text-center">
          <p className="text-destructive">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 pb-4 border-b">
        <h1 className="text-2xl font-semibold">Editor de Status por País</h1>
      </div>

      <CountryEditor
        portfolioData={portfolioData}
        countries={countries}
        procedures={procedures}
        statuses={statuses}
        products={products}
        productTypes={productTypes}
        onSaveComplete={handleSaveComplete}
      />
    </div>
  )
} 