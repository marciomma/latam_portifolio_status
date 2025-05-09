"use client"

import { useState, useEffect } from "react"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusTable } from "@/components/status-table"
import { StatusUpdateForm } from "@/components/status-update-form"
import { CountryEditor } from "@/components/country-editor"
import { ProductsEditor } from "@/components/products-editor"
import { CategoriesProceduresEditor } from "@/components/categories-procedures-editor"
import { PortfolioService } from "@/services/portfolio-service"
import type { Country, PortfolioStatusView, Procedure, ProductType, Status } from "@/types/database"

export function PortfolioStatusDashboard() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [portfolioData, setPortfolioData] = useState<PortfolioStatusView[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Inicializar o banco de dados
        const initResponse = await fetch("/api/init-db")
        if (!initResponse.ok) {
          throw new Error("Failed to initialize database")
        }

        // Carregar dados
        const countriesData = await PortfolioService.getCountries()
        const proceduresData = await PortfolioService.getProcedures()
        const productTypesData = await PortfolioService.getProductTypes()
        const statusesData = await PortfolioService.getStatuses()
        const portfolioViewData = await PortfolioService.getPortfolioStatusView()

        setCountries(countriesData)
        setProcedures(proceduresData)
        setProductTypes(productTypesData)
        setStatuses(statusesData)
        setPortfolioData(portfolioViewData)

        // Selecionar todos os países por padrão
        setSelectedCountries(countriesData.map((c) => c.id))
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load data. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const toggleCountry = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== countryId))
    } else {
      setSelectedCountries([...selectedCountries, countryId])
    }
  }

  const selectAllCountries = () => {
    setSelectedCountries(countries.map((c) => c.id))
  }

  const clearAllCountries = () => {
    setSelectedCountries([])
  }

  // Function to refresh data after updates
  const refreshData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const portfolioViewData = await PortfolioService.getPortfolioStatusView()
      const proceduresData = await PortfolioService.getProcedures()
      const productTypesData = await PortfolioService.getProductTypes()

      setPortfolioData(portfolioViewData)
      setProcedures(proceduresData)
      setProductTypes(productTypesData)
    } catch (err) {
      console.error("Error refreshing data:", err)
      setError("Failed to refresh data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-red-500 text-4xl">⚠️</div>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Direct Market Portfolio Status</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="mb-4">
              <h3 className="mb-2 font-medium">Countries</h3>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <Button
                    key={country.id}
                    variant={selectedCountries.includes(country.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCountry(country.id)}
                  >
                    {country.name}
                  </Button>
                ))}
                <Button variant="secondary" size="sm" onClick={selectAllCountries}>
                  Select All
                </Button>
                <Button variant="secondary" size="sm" onClick={clearAllCountries}>
                  Clear All
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Status Legend</h3>
              <div className="flex flex-wrap gap-3">
                {statuses
                  .filter((s) => s.code)
                  .map((status) => (
                    <div key={status.id} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: status.color }}></div>
                      <span className="text-sm">{status.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="view">View Status</TabsTrigger>
          <TabsTrigger value="update">Update Status</TabsTrigger>
          <TabsTrigger value="country-edit">Country Editor</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories-procedures">Categories & Procedures</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardContent className="p-0 sm:p-6">
              <StatusTable
                portfolioData={portfolioData}
                countries={countries}
                selectedCountryIds={selectedCountries}
                procedures={procedures}
                productTypes={productTypes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update">
          <Card>
            <CardContent className="p-6">
              <StatusUpdateForm
                portfolioData={portfolioData}
                countries={countries}
                procedures={procedures}
                statuses={statuses}
                onUpdate={refreshData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country-edit">
          <Card>
            <CardContent className="p-6">
              <CountryEditor
                portfolioData={portfolioData}
                countries={countries}
                procedures={procedures}
                statuses={statuses}
                onUpdate={refreshData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-6">
              <ProductsEditor procedures={procedures} productTypes={productTypes} onUpdate={refreshData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories-procedures">
          <Card>
            <CardContent className="p-6">
              <CategoriesProceduresEditor onUpdate={refreshData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
