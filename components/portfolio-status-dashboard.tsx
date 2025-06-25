"use client";

import React, { useState, useEffect, useRef } from "react";
import { Filter, Printer, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusTable } from "@/components/status-table";
import { ProductsEditor } from "@/components/products-editor";
import {ProductsClassificationEditor} from "@/components/products-classification-editor";
import { CountriesEditor } from "@/components/countries-editor";
import { StatusEditor } from "@/components/status-editor";

import type {
  Country,
  PortfolioStatusView,
  Procedure,
  ProductType,
  Status,
  Product
} from "@/types/database";

// Chave para o sessionStorage
const APP_STATE_KEY = 'portfolio-dashboard-state';

/**
 * Sistema de Persistência de Estado
 * 
 * Esta implementação mantém o estado da aplicação durante refresh do navegador:
 * - Aba ativa (view, status-editor, products, categories-procedures, countries)
 * - Países selecionados nos filtros
 * - Estado de visibilidade dos filtros
 * 
 * Funcionalidades:
 * - F5/Ctrl+R: Recarrega dados mantendo estado atual
 * - Botão Refresh: Recarrega dados manualmente
 * - Estado é limpo automaticamente ao fechar o navegador
 */

// Interface para o estado persistido
interface AppState {
  selectedCountries: string[];
  showFilters: boolean;
  activeTab: string;
}

// Função para salvar estado no sessionStorage
const saveAppState = (state: AppState) => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    sessionStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Erro ao salvar estado da aplicação:', error);
  }
};

// Função para carregar estado do sessionStorage
const loadAppState = (): Partial<AppState> => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return {};
    }
    const saved = sessionStorage.getItem(APP_STATE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Erro ao carregar estado da aplicação:', error);
    return {};
  }
};

export default function PortfolioStatusDashboard() {
  // Estados iniciais - serão restaurados após o mount
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [mounted, setMounted] = useState(false);

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
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  // Restaurar estado salvo na inicialização
  useEffect(() => {
    const savedState = loadAppState();
    if (savedState.selectedCountries) {
      setSelectedCountries(savedState.selectedCountries);
    }
    if (savedState.showFilters !== undefined) {
      setShowFilters(savedState.showFilters);
    }
    if (savedState.activeTab) {
      setActiveTab(savedState.activeTab);
    }
    setMounted(true);
    loadData();
  }, [timestamp]);

  // Salvar estado sempre que houver mudanças (apenas após inicialização)
  useEffect(() => {
    if (mounted) {
      const currentState = {
        selectedCountries,
        showFilters,
        activeTab
      };
      saveAppState(currentState);
    }
  }, [selectedCountries, showFilters, activeTab, mounted]);

  // Listener para teclas F5/Ctrl+R para recarregar dados
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        handleRefreshData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    // Removido o reload automático - será feito apenas no refresh ou quando necessário
  };

  // Função para recarregar dados mantendo o estado atual
  const handleRefreshData = () => {
    setTimestamp(Date.now());
  };

  const toggleCountry = (countryId: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((c) => c !== countryId)
        : [...prev, countryId]
    );
  };

  // Garantir que os países estejam sempre em ordem alfabética
  const sortedCountries = React.useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  const selectAllCountries = () => {
    setSelectedCountries(sortedCountries.map((c) => c.id));
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
            .filter(s => s.code && s.name !== 'Not Available') // Filter out "Not Available" from database
            .sort((a, b) => {
                                        // Custom order: Available, Ready to be Ordered, RA Submitted, RA to be Submitted, Not Planned, Not Available
                          const order: Record<string, number> = {
                            'Available': 1,
                            'Ready to be Ordered': 2,
                            'RA Submitted': 3,
                            'RA to be Submitted': 4,
                            'Not Planned': 5,
                            'Not Available': 6
                          };
              
              const orderA = order[a.id] || 999;
              const orderB = order[b.id] || 999;
              
              return orderA - orderB;
            })
            .map(status => `
              <div style="display: flex; align-items: center; margin-right: 15px;">
                <div style="width: 12px; height: 12px; background-color: ${status.color}; margin-right: 5px;"></div>
                <span style="font-size: 12px;">${status.name}</span>
              </div>
            `).join('')}
          <div style="display: flex; align-items: center; margin-right: 15px;">
            <div style="width: 12px; height: 12px; background-color: #000000; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Not Available</span>
          </div>
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

  if (isLoading || !mounted) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Cabeçalho com filtros - apenas para aba View Status */}
      {activeTab === "view" && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">
                Portfolio Status
                {isLoading && <span className="ml-2 text-sm text-muted-foreground">(Carregando...)</span>}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
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
                  {sortedCountries.map((country) => (
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
                    .filter((s) => s.code && s.name !== 'Not Available') // Filter out "Not Available" from database
                    .sort((a, b) => {
                      // Custom order: Available, Ready to be Ordered, RA Submitted, RA to be Submitted, Not Planned, Not Available
                      const order: Record<string, number> = {
                        'Available': 1,
                        'Ready to be Ordered': 2,
                        'RA Submitted': 3,
                        'RA to be Submitted': 4,
                        'Not Planned': 5,
                        'Not Available': 6
                      };
                      
                      const orderA = order[a.name] || 999;
                      const orderB = order[b.name] || 999;
                      
                      return orderA - orderB;
                    })
                    .map((status) => (
                      <div key={status.id} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm">{status.name}</span>
                      </div>
                    ))}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: '#000000' }}></div>
                    <span className="text-sm">Not Available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Título e Botão Refresh para outras abas */}
      {activeTab !== "view" && (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {activeTab === "country-edit" && "Status Editor"}
            {activeTab === "products" && "Products Editor"}
            {activeTab === "categories-procedures" && "Products Classification Editor"}
            {activeTab === "countries" && "Countries Editor"}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
            {isLoading && <span className="ml-2 text-sm text-muted-foreground">(Carregando...)</span>}
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="view">View Status</TabsTrigger>
          <TabsTrigger value="country-edit">Status Editor</TabsTrigger>
          <TabsTrigger value="products">Products Editor</TabsTrigger>
          <TabsTrigger value="categories-procedures">Products Classification Editor</TabsTrigger>
          <TabsTrigger value="countries">Countries Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardContent className="p-0 sm:p-6">
              <div ref={statusTableRef}>
                <StatusTable
                  portfolioData={portfolioData}
                  countries={sortedCountries}
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
              <StatusEditor
                portfolioData={portfolioData}
                countries={sortedCountries}
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
              <ProductsClassificationEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardContent className="p-6">
              <CountriesEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
