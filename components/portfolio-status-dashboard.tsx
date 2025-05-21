"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Download } from "lucide-react";

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

  const exportTableToPdf = async () => {
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Direct Market Portfolio Status', 14, 15);
      
      // Add status legend
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Status Legend:', 14, 25);
      
      // Draw status legend items
      const legendItems = statuses.filter(s => s.code);
      let xPosition = 14;
      const legendY = 28;
      
      legendItems.forEach((status) => {
        try {
          const color = status.color || '#FFFFFF';
          const rgb = parseColor(color);
          doc.setFillColor(rgb[0], rgb[1], rgb[2]);
          doc.rect(xPosition, legendY, 3, 3, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text(status.name, xPosition + 5, legendY + 3);
        } catch (e) {
          console.error("Error drawing legend item:", e);
        }
        xPosition += 45;
      });
      
      // Get table element
      if (statusTableRef.current) {
        const originalTable = statusTableRef.current.querySelector('table');
        
        if (originalTable) {
          // Clone the table to avoid modifying the original
          const tableClone = originalTable.cloneNode(true) as HTMLTableElement;
          
          // Find all product cells with lifecycle info and modify their format
          const productCells = tableClone.querySelectorAll('td div.text-xs');
          productCells.forEach(div => {
            const parentCell = div.closest('td');
            if (!parentCell) return;
            
            // Get all div.text-xs elements in this cell
            const divs = Array.from(parentCell.querySelectorAll('div.text-xs'));
            if (divs.length < 2) return;
            
            // Get product name and lifecycle
            const productName = divs[0].textContent?.trim() || '';
            let lifecycle = divs[1].textContent?.trim() || '';
            
            // Log original values for debugging
            console.log("Original:", productName, lifecycle);
            
            // Remove parentheses
            lifecycle = lifecycle.replace(/[()]/g, '');
            
            // Replace the content of the cell with our formatted text
            if (productName && lifecycle) {
              // Clear the cell
              while (parentCell.firstChild) {
                parentCell.removeChild(parentCell.firstChild);
              }
              
              // Add formatted text with a space before and after the dash
              const formattedText = `${productName} - ${lifecycle}`;
              console.log("Formatted:", formattedText);
              
              parentCell.appendChild(document.createTextNode(formattedText));
            }
          });
          
          // Use autotable with our modified HTML
          autoTable(doc, {
            html: tableClone,
            startY: 35,
            theme: 'grid',
            styles: { 
              fontSize: 8, 
              cellPadding: 2,
              overflow: 'linebreak',
              halign: 'center',
              valign: 'middle',
            },
            headStyles: { 
              fillColor: [240, 240, 240], 
              textColor: [0, 0, 0],
              fontStyle: 'bold'
            },
            columnStyles: {
              0: { cellWidth: 35 },  // Categoria
              1: { cellWidth: 35 },  // Procedimento
              2: { cellWidth: 35 },  // Tipo de Produto
              // Para todas as colunas de Tier 1 e Tier 2, use a mesma largura
            },
            didParseCell: function(data) {
              try {
                const td = data.cell.raw as HTMLTableCellElement;
                if (!td) return;
                
                // Handle background colors
                if (td.style && td.style.backgroundColor && td.style.backgroundColor !== 'transparent') {
                  const rgb = parseColor(td.style.backgroundColor);
                  if (rgb.length === 3) {
                    data.cell.styles.fillColor = [rgb[0], rgb[1], rgb[2]];
                  }
                }
                
                // Ensure text formatting is preserved
                if (data.cell.text && Array.isArray(data.cell.text)) {
                  // Check if we have product text that needs formatting
                  const text = data.cell.text.join(' ');
                  if (text.includes('(Flagship)')) {
                    data.cell.text = [text.replace('(Flagship)', ' (Flagship)')];
                  } else if (text.includes('(Maintain)')) {
                    data.cell.text = [text.replace('(Maintain)', ' (Maintain)')];
                  } else if (text.includes('(De-emphasize)')) {
                    data.cell.text = [text.replace('(De-emphasize)', ' (De-emphasize)')];
                  }
                }

                // Aqui você pode definir a largura para colunas além das 3 primeiras
                if (data.column.index > 2) {
                  data.cell.styles.cellWidth = 25; // Largura fixa para colunas de produtos
                }
              } catch (e) {
                console.error("Error parsing cell:", e);
              }
            },
            didDrawPage: (data) => {
              // Add page number at the bottom of each page
              const pageSize = doc.internal.pageSize;
              const pageNumber = data.pageNumber;
              
              doc.setFontSize(8);
              doc.text(
                'Page ' + pageNumber.toString(),
                pageSize.getWidth() - 20,
                pageSize.getHeight() - 10
              );
            }
          });
          
          // Save the PDF
          doc.save('portfolio-status.pdf');
        }
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. See console for details.");
    }
  };
  
  // More robust color parser that handles different color formats
  const parseColor = (color: string): number[] => {
    // Default to black if color parsing fails
    const defaultColor = [0, 0, 0];
    
    try {
      // Handle hex format
      if (color.startsWith('#')) {
        return hexToRgb(color);
      }
      
      // Handle rgb/rgba format
      if (color.startsWith('rgb')) {
        const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10)
          ];
        }
      }
      
      // Handle named colors
      if (color === 'transparent') {
        return [255, 255, 255]; // White for transparent
      }
      
      return defaultColor;
    } catch (e) {
      console.error("Error parsing color:", color, e);
      return defaultColor;
    }
  };
  
  // Helper function to convert hex color to RGB array for jsPDF
  const hexToRgb = (hex: string): number[] => {
    try {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Handle shorthand hex (e.g. #ABC)
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      
      // Convert to RGB
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Validate the values
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return [0, 0, 0]; // Default to black if parsing fails
      }
      
      return [r, g, b];
    } catch (e) {
      console.error("Error converting hex to RGB:", hex, e);
      return [0, 0, 0]; // Default to black if any error occurs
    }
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
                onClick={exportTableToPdf}
                className="flex items-center gap-2"
                disabled={activeTab !== "view"}
              >
                <Download className="h-4 w-4" />
                Export PDF
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
