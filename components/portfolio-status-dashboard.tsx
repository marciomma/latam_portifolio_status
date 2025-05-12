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

import type {
  Country,
  PortfolioStatusView,
  Procedure,
  ProductType,
  Status
} from "@/types/database"

export function PortfolioStatusDashboard() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [countries, setCountries] = useState<Country[]>([])
  const [portfolioData, setPortfolioData] = useState<PortfolioStatusView[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          countriesData,
          portfolioViewData,
          proceduresData,
          productTypesData,
          statusesData
        ] = await Promise.all([
          PortfolioService.getCountries(),
          PortfolioService.getPortfolioStatusView(),
          PortfolioService.getProcedures(),
          PortfolioService.getProductTypes(),
          PortfolioService.getStatuses()
        ])

        setCountries(countriesData)
        setPortfolioData(portfolioViewData)
        setProcedures(proceduresData)
        setProductTypes(productTypesData)
        setStatuses(statusesData)
        setSelectedCountries(countriesData.map((c) => c.id))
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const toggleCountry = (countryId: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((c) => c !== countryId)
        : [...prev, countryId]
    )
  }

  const selectAllCountries = () => {
    setSelectedCountries(countries.map((c) => c.id))
  }

  const clearAllCountries = () => {
    setSelectedCountries([])
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
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
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-6">
              <ProductsEditor
                procedures={procedures}
                productTypes={productTypes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories-procedures">
          <Card>
            <CardContent className="p-6">
              <CategoriesProceduresEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
