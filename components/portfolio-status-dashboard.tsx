"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusTable } from "@/components/status-table";
import { CountryEditor } from "@/components/country-editor";
import { ProductsEditor } from "@/components/products-editor";
import {CategoriesProceduresEditor} from "@/components/categories-procedures-editor";
import { PortfolioService } from "@/services/portfolio-service";

import type {
  Country,
  PortfolioStatusView,
  Procedure,
  ProductType,
  Status,
  Product
} from "@/types/database";

export default function PortfolioStatusDashboard() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  const [countries, setCountries] = useState<Country[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioStatusView[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());
  const statusTableRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/load-dashboard-data?_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("Dados recebidos da API:", {
        countries: data.countries?.length || 0,
        portfolio: data.portfolioData?.length || 0,
        procedures: data.procedures?.length || 0,
        productTypes: data.productTypes?.length || 0,
        statuses: data.statuses?.length || 0,
        products: data.products?.length || 0
      });
      
      setCountries(data.countries || []);
      setPortfolioData(data.portfolioData || []);
      setProcedures(data.procedures || []);
      setProductTypes(data.productTypes || []);
      setStatuses(data.statuses || []);
      setProducts(data.products || []);
      
      if (!selectedCountries.length && data.countries?.length) {
        setSelectedCountries((data.countries || []).map((c: Country) => c.id));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timestamp]);

  useEffect(() => {
    // Add meta tag for color printing
    const metaTag = document.createElement('meta');
    metaTag.name = 'color-scheme';
    metaTag.content = 'normal';
    document.head.appendChild(metaTag);
    
    // Add CSS for color printing
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: landscape;
        margin: 10mm;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(metaTag);
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('reload')) {
      setTimestamp(Date.now());
      
      const newUrl = window.location.pathname + 
        window.location.search.replace(/(\?|&)reload=[^&]*(&|$)/, '$1').replace(/\?$/, '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "view") {
      setTimestamp(Date.now());
    }
  };

  const toggleCountry = (countryId: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((c) => c !== countryId)
        : [...prev, countryId]
    );
  };

  const selectAllCountries = () => {
    setSelectedCountries(countries.map((c) => c.id));
  };

  const clearAllCountries = () => {
    setSelectedCountries([]);
  };

  const handlePrint = () => {
    // Create print-only legend
    const printLegend = document.createElement('div');
    printLegend.className = 'print-only-legend';
    printLegend.style.cssText = 'display: none; margin-bottom: 20px;';
    
    // Add title and legend
    const legendHTML = `
      <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; text-align: center;">
        Direct Market Portfolio Status
      </h1>
      <div style="margin-top: 5px; margin-bottom: 15px;">
        <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Status Legend:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${statuses
            .filter(s => s.code)
            .map(status => `
              <div style="display: flex; align-items: center; margin-right: 15px;">
                <div style="width: 12px; height: 12px; background-color: ${status.color}; margin-right: 5px;"></div>
                <span style="font-size: 12px;">${status.name}</span>
              </div>
            `).join('')}
        </div>
      </div>
    `;
    
    printLegend.innerHTML = legendHTML;
    
    // Add to document before printing
    if (statusTableRef.current?.parentNode) {
      statusTableRef.current.parentNode.insertBefore(printLegend, statusTableRef.current);
    }
    
    // Show legend only for printing
    window.addEventListener('beforeprint', () => {
      printLegend.style.display = 'block';
    });
    
    // Hide legend after printing
    window.addEventListener('afterprint', () => {
      if (printLegend.parentNode) {
        printLegend.parentNode.removeChild(printLegend);
      }
    });
    
    // Trigger print
    window.print();
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Portfolio Status</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
                disabled={activeTab !== "view"}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="view">View Status</TabsTrigger>
          <TabsTrigger value="country-edit">Country Editor</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories-procedures">Categories & Procedures</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardContent className="p-0 sm:p-6">
              <div ref={statusTableRef}>
                <StatusTable
                  portfolioData={portfolioData}
                  countries={countries}
                  selectedCountryIds={selectedCountries}
                  procedures={procedures}
                  productTypes={productTypes}
                />
              </div>
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
                products={products}
                productTypes={productTypes}
                onSaveComplete={() => setTimestamp(Date.now())}
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
  );
}
