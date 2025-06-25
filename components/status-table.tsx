"use client"

import { useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Country, PortfolioStatusView, Procedure, ProductType } from "@/types/database"

interface StatusTableProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  selectedCountryIds: string[]
  procedures?: Procedure[]
  productTypes?: ProductType[]
}

export function StatusTable({
  portfolioData,
  countries,
  selectedCountryIds,
  procedures = [],
  productTypes = [],
}: StatusTableProps) {
  const [procedureFilter, setProcedureFilter] = useState<string>("all")
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all")
  const [lifeCycleFilter, setLifeCycleFilter] = useState<string>("all")
  const tableRef = useRef<HTMLDivElement>(null)

  // If no countries are selected, don't show the table
  if (selectedCountryIds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Select at least one country to view the status table</p>
      </div>
    )
  }

  // Apply filters
  const filteredData = portfolioData.filter((item) => {
    const matchesProcedure = procedureFilter === "all" || item.procedureId === procedureFilter
    const matchesProductType = productTypeFilter === "all" || item.productTypeId === productTypeFilter
    const matchesLifeCycle = lifeCycleFilter === "all" || item.productLifeCycle === lifeCycleFilter
    return matchesProcedure && matchesProductType && matchesLifeCycle
  })

  // Group data by category, procedure, and product type
  const groupedData: Record<string, Record<string, Record<string, PortfolioStatusView[]>>> = {}

  filteredData.forEach((item) => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = {}
    }

    if (!groupedData[item.category][item.procedure]) {
      groupedData[item.category][item.procedure] = {}
    }

    if (!groupedData[item.category][item.procedure][item.productType]) {
      groupedData[item.category][item.procedure][item.productType] = []
    }

    groupedData[item.category][item.procedure][item.productType].push(item)
  })

  // Filter countries based on selection
  const filteredCountries = countries.filter((country) => selectedCountryIds.includes(country.id))
  
  // Function to determine if background color is dark and text should be white
  const isDarkColor = (color: string | undefined) => {
    if (!color) return false;
    
    // Check for "None" status specifically (common dark colors)
    const darkColors = ['#000000', '#000', 'black', '#333333', '#333'];
    if (darkColors.includes(color.toLowerCase())) {
      return true;
    }
    
    // Convert hex to RGB and calculate luminance
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      // Convert 3-digit hex to 6-digit
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    
    return false;
  }

  return (
    <div>
      {/* Additional filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Procedure</label>
          <Select value={procedureFilter} onValueChange={setProcedureFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by procedure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Procedures</SelectItem>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Product Type</label>
          <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Product Types</SelectItem>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Life Cycle</label>
          <Select value={lifeCycleFilter} onValueChange={setLifeCycleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by life cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Life Cycles</SelectItem>
              <SelectItem value="Flagship">Flagship</SelectItem>
              <SelectItem value="Maintain">Maintain</SelectItem>
              <SelectItem value="De-emphasize">De-emphasize</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto" ref={tableRef}>
        {/* Tabela normal */}
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="border text-center w-[120px] bg-gray-100 text-black">
                Category
              </TableHead>
              <TableHead rowSpan={2} className="border text-center w-[150px] bg-gray-100 text-black">
                Procedure
              </TableHead>
              <TableHead rowSpan={2} className="border text-center w-[150px] bg-gray-100 text-black">
                Product Type
              </TableHead>
              {filteredCountries.map((country) => (
                <TableHead key={country.id} colSpan={2} className="border text-center bg-gray-100 text-black">
                  {country.name}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {filteredCountries.flatMap((country) => [
                <TableHead 
                  key={`${country.id}-tier1`} 
                  className="border text-center bg-gray-50 text-xs text-black"
                  style={{ width: '150px', minWidth: '150px' }}
                >
                  Tier 1
                </TableHead>,
                <TableHead 
                  key={`${country.id}-tier2`} 
                  className="border text-center bg-gray-50 text-xs text-black"
                  style={{ width: '150px', minWidth: '150px' }}
                >
                  Tier 2
                </TableHead>,
              ])}
            </TableRow>
          </TableHeader>

          <TableBody>
            {Object.entries(groupedData)
              .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
              .map(([category, procedures]) => {
                // Track which rows will actually be rendered
                const validRowsInCategory = new Set();
                
                // First pass to determine which rows will be rendered
                Object.entries(procedures).forEach(([proc, productTypes]) => {
                  Object.entries(productTypes).forEach(([prodType, products]) => {
                    if (products.length === 0) return;
                    
                    // Check if this row has any products for any country
                    const tier1Products = products.filter((p) => p.productTier === "Tier 1");
                    const tier2Products = products.filter((p) => p.productTier === "Tier 2");
                    
                    const hasAnyProducts = filteredCountries.some(country => {
                      const hasTier1 = tier1Products.some(p => 
                        p.countryStatuses.some(cs => cs.countryId === country.id)
                      );
                      
                      const hasTier2 = tier2Products.some(p => 
                        p.countryStatuses.some(cs => cs.countryId === country.id)
                      );
                      
                      return hasTier1 || hasTier2;
                    });
                    
                    if (hasAnyProducts) {
                      validRowsInCategory.add(`${proc}-${prodType}`);
                    }
                  });
                });
                
                // Calculate total rows for this category correctly
                const totalRows = validRowsInCategory.size;
                
                let rowsRendered = 0;
                const validProcedureRows = new Map<string, number>();
                
                // Calculate rows per procedure
                Object.entries(procedures).forEach(([proc, productTypes]) => {
                  let count = 0;
                  Object.entries(productTypes).forEach(([prodType]) => {
                    if (validRowsInCategory.has(`${proc}-${prodType}`)) {
                      count++;
                    }
                  });
                  if (count > 0) {
                    validProcedureRows.set(proc, count);
                  }
                });

                return Object.entries(procedures)
                  .sort(([procedureA], [procedureB]) => procedureA.localeCompare(procedureB))
                  .flatMap(([procedure, productTypes]) => {
                    // If this procedure doesn't have any valid rows, skip it
                    if (!validProcedureRows.has(procedure)) return [];
                    
                    const procedureRows = validProcedureRows.get(procedure) || 0;
                    let procRowsRendered = 0;

                    return Object.entries(productTypes)
                      .sort(([productTypeA], [productTypeB]) => productTypeA.localeCompare(productTypeB))
                      .flatMap(([productType, products]) => {
                        if (products.length === 0) return [];
                        
                        // Check if this row is valid (has products for any country)
                        const rowValidKey = `${procedure}-${productType}`;
                        if (!validRowsInCategory.has(rowValidKey)) return [];
                        
                        const isFirstInProcedure = procRowsRendered === 0;
                        const isFirstInCategory = isFirstInProcedure && rowsRendered === 0;
                        
                        procRowsRendered++;
                        if (isFirstInProcedure) {
                          rowsRendered++;
                        }

                        // Group products by tier
                        const tier1Products = products.filter((p) => p.productTier === "Tier 1");
                        const tier2Products = products.filter((p) => p.productTier === "Tier 2");

                        // Check if this row has any products for any of the selected countries
                        const hasAnyProducts = filteredCountries.some(country => {
                          // Check if there are Tier 1 products for this country
                          const hasTier1 = tier1Products.some(p => 
                            p.countryStatuses.some(cs => cs.countryId === country.id)
                          );
                          
                          // Check if there are Tier 2 products for this country
                          const hasTier2 = tier2Products.some(p => 
                            p.countryStatuses.some(cs => cs.countryId === country.id)
                          );
                          
                          return hasTier1 || hasTier2;
                        });
                        
                        // Skip this row if there are no products for any country
                        if (!hasAnyProducts) return [];

                        return (
                          <TableRow key={`${category}-${procedure}-${productType}`}>
                            {isFirstInCategory && (
                              <TableCell rowSpan={totalRows} className="border font-medium align-middle">
                                {category}
                              </TableCell>
                            )}
                            {isFirstInProcedure && (
                              <TableCell rowSpan={procedureRows} className="border align-middle">
                                {procedure}
                              </TableCell>
                            )}
                            <TableCell className="border">{productType}</TableCell>

                            {filteredCountries.flatMap((country) => {
                              // Tier 1 products for this country
                              const tier1ProductsForCountry = tier1Products.filter((p) =>
                                p.countryStatuses.some((cs) => cs.countryId === country.id)
                              );

                              // Tier 2 products for this country
                              const tier2ProductsForCountry = tier2Products.filter((p) =>
                                p.countryStatuses.some((cs) => cs.countryId === country.id)
                              );

                              // Get status for each product
                              const getStatus = (product: PortfolioStatusView) =>
                                product.countryStatuses.find((cs: PortfolioStatusView["countryStatuses"][number]) => cs.countryId === country.id);

                              return [
                                // Tier 1 cell
                                <TableCell
                                  key={`${category}-${procedure}-${productType}-${country.id}-tier1`}
                                  className="border text-center font-medium"
                                  style={{
                                    width: '150px',
                                    minWidth: '150px'
                                  }}
                                >
                                  {tier1ProductsForCountry.length > 0 ? (
                                    <div className="flex flex-col gap-1 items-center">
                                      {tier1ProductsForCountry.map((product) => {
                                        const status = getStatus(product);
                                        const textColor = isDarkColor(status?.statusColor) ? 'white' : 'inherit';
                                        return (
                                          <div
                                            key={product.productId}
                                            className="text-xs rounded p-1 w-full max-w-[120px]"
                                            style={{ 
                                              backgroundColor: status?.statusColor || undefined,
                                              color: textColor
                                            }}
                                          >
                                            <div className="font-[550]">{product.product}</div>
                                            <div className="italic">({product.productLifeCycle})</div>
                                            {status?.setsQty && (
                                              <div className="text-xs font-medium mt-1">Sets: {status.setsQty}</div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400">-</div>
                                  )}
                                </TableCell>,

                                // Tier 2 cell
                                <TableCell
                                  key={`${category}-${procedure}-${productType}-${country.id}-tier2`}
                                  className="border text-center font-medium"
                                  style={{
                                    width: '150px',
                                    minWidth: '150px'
                                  }}
                                >
                                  {tier2ProductsForCountry.length > 0 ? (
                                    <div className="flex flex-col gap-1 items-center">
                                      {tier2ProductsForCountry.map((product) => {
                                        const status = getStatus(product);
                                        const textColor = isDarkColor(status?.statusColor) ? 'white' : 'inherit';
                                        return (
                                          <div
                                            key={product.productId}
                                            className="text-xs rounded p-1 w-full max-w-[120px]"
                                            style={{ 
                                              backgroundColor: status?.statusColor || undefined,
                                              color: textColor
                                            }}
                                          >
                                            <div className="font-[550]">{product.product}</div>
                                            <div className="italic">({product.productLifeCycle})</div>
                                            {status?.setsQty && (
                                              <div className="text-xs font-medium mt-1">Sets: {status.setsQty}</div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400">-</div>
                                  )}
                                </TableCell>,
                              ]
                            })}
                          </TableRow>
                        )
                      })
                  })
              })}
            {Object.keys(groupedData).length === 0 && (
              <TableRow>
                <TableCell colSpan={3 + filteredCountries.length * 2} className="h-24 text-center">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
