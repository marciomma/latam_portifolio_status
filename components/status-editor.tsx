"use client"

import React, { useState, useEffect } from "react"
import { Check, Plus, Save, Trash2, Eye, ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PortfolioService } from "@/services/portfolio-service"
import type { Country, PortfolioStatusView, Procedure, Status, Product, ProductType } from "@/types/database"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface StatusEditorProps {
  portfolioData: PortfolioStatusView[]
  countries: Country[]
  selectedCountryIds?: string[] // Agora é opcional
  procedures: Procedure[]
  statuses: Status[]
  products: Product[]
  productTypes: ProductType[]
  onSaveComplete?: () => void
}

type CountryLineItem = {
  id: string
  productId: string
  statusId: string
  setsQty: string
  isModified: boolean
}

export function StatusEditor({ 
  portfolioData, 
  countries, 
  selectedCountryIds = [], // Valor padrão agora é um array vazio
  procedures, 
  statuses, 
  products, 
  productTypes, 
  onSaveComplete 
}: StatusEditorProps) {
  const [countryLines, setCountryLines] = useState<CountryLineItem[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  // Manter um registro permanente de produtos excluídos por país
  const [deletedProductsByCountry, setDeletedProductsByCountry] = useState<Record<string, Set<string>>>({})
  // Estado para controlar o país selecionado internamente
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: 'product',
    direction: 'ascending'
  });
  // Estado para controlar o popup de confirmação de exclusão
  const [productToDelete, setProductToDelete] = useState<{ lineId: string; productName: string } | null>(null);
  
  // Inicialização do país selecionado
  useEffect(() => {
    // Se já temos um país selecionado, não fazer nada
    if (selectedCountry) return;
    
    // Se temos países selecionados do componente pai, usar o primeiro
    if (selectedCountryIds.length > 0) {
      setSelectedCountry(selectedCountryIds[0]);
    }
    // Se não, mas temos países disponíveis, selecionar o primeiro da lista
    else if (countries.length > 0) {
      setSelectedCountry(countries[0].id);
    }
  }, [selectedCountryIds, countries]);  // Remover selectedCountry da dependência para evitar loops
  
  // Usar useEffect para carregar os dados quando o país selecionado mudar
  useEffect(() => {
    if (selectedCountry) {
      loadCountryData(selectedCountry);
    } else {
      setCountryLines([]);
    }
  }, [selectedCountry, deletedProductsByCountry]);
  
  // Adicionar linha em branco no início
  const addEmptyLine = () => {
    // Criar nova linha vazia
    const newLine: CountryLineItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      productId: "",
      statusId: "",
      setsQty: "",
      isModified: true
    }
    
    // Limpar linhas vazias existentes e adicionar apenas a nova
    setCountryLines(prevLines => {
      // Filtrar apenas linhas com produto (remover todas as linhas vazias)
      const nonEmptyLines = prevLines.filter(line => line.productId);
      
      // Adicionar a nova linha vazia no início
      return [newLine, ...nonEmptyLines];
    });
  }
  
  // Preparar para remover linha - mostra popup de confirmação
  const prepareRemoveLine = (id: string) => {
    const lineToDelete = countryLines.find(line => line.id === id);
    if (!lineToDelete) return;

    // Para linhas novas (sem produto selecionado), remover diretamente
    if (!lineToDelete.productId) {
      setCountryLines(prevLines => 
        prevLines.filter(line => line.id !== id)
      );
      return;
    }

    // Para linhas com produto, mostrar confirmação
    const product = getProduct(lineToDelete.productId);
    const productName = product?.name || "Unknown Product";
    
    setProductToDelete({
      lineId: id,
      productName: productName
    });
  }

  // Remover linha após confirmação
  const confirmRemoveLine = async (id: string) => {
    const lineToDelete = countryLines.find(line => line.id === id);
    if (!lineToDelete || !selectedCountry) return;

    try {
      // Para linhas existentes no banco, fazer exclusão via API
      if (id.startsWith('existing-') && lineToDelete.productId) {
        setSuccessMessage("Deleting product...");
        
        // Chamar API para excluir
        const deleteUpdate = {
          productId: lineToDelete.productId,
          countryId: selectedCountry,
          statusId: "", // Status vazio indica exclusão
          setsQty: ""
        };

        const response = await fetch('/api/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([deleteUpdate]),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error deleting: ${response.status} - ${errorText}`);
        }

        // Adicionar ao registro permanente de exclusões
        setDeletedProductsByCountry(prev => {
          const updatedMap = {...prev};
          if (!updatedMap[selectedCountry]) {
            updatedMap[selectedCountry] = new Set<string>();
          }
          updatedMap[selectedCountry].add(lineToDelete.productId);
          return updatedMap;
        });

        // Remover da interface
        setCountryLines(prevLines => 
          prevLines.filter(line => line.id !== id)
        );

        setSuccessMessage("Product deleted successfully");
        
        // Recarregar dados após exclusão
        setTimeout(async () => {
          try {
            // Forçar reconstrução da view
            await PortfolioService.rebuildPortfolioStatusView();
            
            // Pequeno delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Recarregar dados do país
            loadCountryData(selectedCountry);
            
            setSuccessMessage("Data reloaded successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
          } catch (error) {
            console.error('Error reloading data:', error);
            setSuccessMessage(`Error reloading data: ${error instanceof Error ? error.message : String(error)}`);
          }
        }, 1000);

      } else {
        // Para linhas novas, remover apenas da interface
        setCountryLines(prevLines => 
          prevLines.filter(line => line.id !== id)
        );
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setSuccessMessage(`Error deleting product: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    }

    // Fechar popup
    setProductToDelete(null);
  }

  // Função para alterar o país selecionado
  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  // Carregar dados do país selecionado
  const loadCountryData = (countryId: string) => {
    console.log('Loading country data for:', countryId);
    if (!countryId) {
      setCountryLines([])
      return
    }
    
    // Obter produtos excluídos para este país
    const deletedProducts = deletedProductsByCountry[countryId] || new Set<string>();
    
    // Buscar os status atuais do país selecionado, filtrando produtos excluídos
    const existingStatusPortfolios = portfolioData
      .filter(item => 
        item.countryStatuses.some(cs => cs.countryId === countryId) && 
        !deletedProducts.has(item.productId)
      )
      .map(item => {
        const countryStatus = item.countryStatuses.find(cs => cs.countryId === countryId)
        return {
          id: `existing-${item.id}`,
          productId: item.productId,
          statusId: countryStatus?.statusId || "",
          setsQty: countryStatus?.setsQty || "", // Use setsQty from database
          isModified: false
        }
      });
    
    if (existingStatusPortfolios.length === 0) {
      // Se não há dados, criar exatamente uma linha em branco nova
      const emptyLine: CountryLineItem = {
        id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId: "",
        statusId: "",
        setsQty: "",
        isModified: true
      };
      setCountryLines([emptyLine]);
    } else {
      // Se há dados existentes, usar apenas eles (sem linhas em branco)
      setCountryLines(existingStatusPortfolios);
    }
  }

  // Mudar produto
  const handleProductChange = (lineId: string, productId: string) => {
    setCountryLines(prevLines => 
      prevLines.map(line => 
        line.id === lineId 
          ? { 
              ...line, 
              productId: productId === "none" ? "" : productId,
              setsQty: line.setsQty || "", // Preserve or initialize setsQty
              isModified: true 
            } 
          : line
      )
    );
  }
  
  // Mudar status
  const handleStatusChange = (lineId: string, statusId: string) => {
    setCountryLines(prevLines => 
      prevLines.map(line => 
        line.id === lineId 
          ? { 
              ...line, 
              statusId: statusId === "none" ? "" : statusId,
              setsQty: line.setsQty || "", // Preserve setsQty
              isModified: true 
            } 
          : line
      )
    );
  }

  // Add handleLineChange function
  const handleLineChange = (lineId: string, field: keyof CountryLineItem, value: string) => {
    setCountryLines(prevLines => 
      prevLines.map(line => 
        line.id === lineId 
          ? { ...line, [field]: value, isModified: true } 
          : line
      )
    );
  };

  // Salvar alterações
  const handleSave = async () => {
    // Filtrar linhas válidas (com produto e status selecionados) para atualizar ou criar
    const validLines = countryLines.filter(line => 
      line.productId && 
      line.statusId && 
      line.isModified
    );
    
    if (validLines.length === 0) {
      setSuccessMessage("No valid changes to save");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    // Guardar o país atual para preservar após save
    const currentSelectedCountry = selectedCountry;
    
    // Preparar atualizações para enviar à API
    const updates = validLines.map(line => ({
      productId: line.productId,
      countryId: currentSelectedCountry,
      statusId: line.statusId,
      setsQty: line.setsQty || "" // Include setsQty in updates
    }));
    
    try {
      console.log("Sending updates:", updates);
      
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error saving: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Update result:', result);
      
      // Mostrar mensagem de sucesso
      const countryName = countries.find(c => c.id === currentSelectedCountry)?.name || currentSelectedCountry;
      setSuccessMessage(`Status successfully updated for ${countryName} (${updates.length} changes)`);
      
      // Resetar flags de modificação
      setCountryLines(prevLines => 
        prevLines.map(line => ({
          ...line,
          isModified: false
        }))
      );
      
      // Recarregar dados preservando o país selecionado
      const refreshDataForCurrentCountry = async () => {
        try {
          setSuccessMessage("Refreshing data from server...");
          
          // Primeiro, forçar a reconstrução da view de portfólio no Redis
          await PortfolioService.rebuildPortfolioStatusView();
          
          // Pequeno delay para garantir que o Redis foi atualizado
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Notificar o componente pai para atualizar os dados (uma única vez)
          if (onSaveComplete) {
            await onSaveComplete();
          }
          
          // Agora buscar dados atualizados
          const freshPortfolioData = await PortfolioService.getPortfolioStatusView();
          
          console.log("Reloading with fresh data:", freshPortfolioData.length, "products for country", currentSelectedCountry);
          
          // Atualizar localmente apenas para o país atual
          const freshCountryLines = freshPortfolioData
            .filter(item => 
              item.countryStatuses.some(cs => cs.countryId === currentSelectedCountry) && 
              !deletedProductsByCountry[currentSelectedCountry]?.has(item.productId)
            )
            .map(item => {
              const countryStatus = item.countryStatuses.find(cs => cs.countryId === currentSelectedCountry);
              return {
                id: `existing-${item.id}`,
                productId: item.productId,
                statusId: countryStatus?.statusId || "",
                setsQty: countryStatus?.setsQty || "",
                isModified: false
              };
            });
          
          console.log("Found", freshCountryLines.length, "lines for country", currentSelectedCountry);
          
          // Garantir que o país selecionado permanece o mesmo após refresh
          console.log('Preserving selected country:', currentSelectedCountry);
          setSelectedCountry(currentSelectedCountry);
          
          if (freshCountryLines.length === 0) {
            // Se não há dados, criar linha em branco
            setCountryLines([{
              id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              productId: "",
              statusId: "",
              setsQty: "",
              isModified: true
            }]);
          } else {
            // Se há dados, usar eles
            setCountryLines(freshCountryLines);
          }
          
          setSuccessMessage("Data refreshed successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
          
        } catch (error) {
          console.error('Error refreshing data:', error);
          setSuccessMessage(`Error refreshing data: ${error instanceof Error ? error.message : String(error)}`);
          setTimeout(() => setSuccessMessage(""), 5000);
        }
      };
      
      // Executar a atualização com delay para garantir que o save foi processado
      setTimeout(refreshDataForCurrentCountry, 1000);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setSuccessMessage(`Error saving: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }
  
  // Obter produto a partir do ID
  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId)
  }
  
  // Obter procedimento a partir do ID
  const getProcedure = (procedureId: string) => {
    return procedures.find(p => p.id === procedureId)
  }
  
  // Obter produtos disponíveis (que ainda não foram escolhidos para este país)
  const getAvailableProducts = (currentLineId: string) => {
    // Return all products, allowing the same product to be used multiple times
    return products;
  }

  // Remover linhas vazias antes de exibir - abordagem mais direta
  const displayLines = countryLines
    // Processar o resultado para garantir apenas uma linha vazia
    .reduce((filtered, line) => {
      // Se a linha tem produto, sempre adicionar
      if (line.productId) {
        filtered.push(line);
      } else {
        // Se é uma linha vazia, apenas adicionar se ainda não temos uma
        if (!filtered.some(l => !l.productId)) {
          filtered.push(line);
        }
      }
      return filtered;
    }, [] as CountryLineItem[]);

  // Função para ordenar as linhas da tabela
  const sortedLines = React.useMemo(() => {
    const sortableLines = [...displayLines];
    if (sortConfig.direction !== null) {
      sortableLines.sort((a, b) => {
        // Ordenar com base na coluna selecionada
        switch(sortConfig.key) {
          case 'product':
            const productA = getProduct(a.productId)?.name || '';
            const productB = getProduct(b.productId)?.name || '';
            return sortConfig.direction === 'ascending' 
              ? productA.localeCompare(productB)
              : productB.localeCompare(productA);
          
          case 'status':
            const statusA = statuses.find(s => s.id === a.statusId)?.name || '';
            const statusB = statuses.find(s => s.id === b.statusId)?.name || '';
            return sortConfig.direction === 'ascending' 
              ? statusA.localeCompare(statusB)
              : statusB.localeCompare(statusA);
          
          case 'procedure':
            const productProcA = getProduct(a.productId);
            const productProcB = getProduct(b.productId);
            const procedureA = productProcA ? getProcedure(productProcA.procedureId)?.category || '' : '';
            const procedureB = productProcB ? getProcedure(productProcB.procedureId)?.category || '' : '';
            return sortConfig.direction === 'ascending' 
              ? procedureA.localeCompare(procedureB)
              : procedureB.localeCompare(procedureA);
          
          case 'lifecycle':
            const productLifeA = getProduct(a.productId)?.productLifeCycle || '';
            const productLifeB = getProduct(b.productId)?.productLifeCycle || '';
            return sortConfig.direction === 'ascending' 
              ? productLifeA.localeCompare(productLifeB)
              : productLifeB.localeCompare(productLifeA);
          
          default:
            return 0;
        }
      });
    }
    return sortableLines;
  }, [displayLines, sortConfig]);

  // Função para alternar a ordenação
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
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

  // Verificar se tem países disponíveis
  if (countries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No countries available for editing</p>
      </div>
    );
  }

  // Nome do país selecionado
  const countryName = countries.find(c => c.id === selectedCountry)?.name || "Country";

  return (
    <div>

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

      <div className="mt-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Country:</h3>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addEmptyLine}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>

          <Button 
            onClick={handleSave}
            disabled={!countryLines.some(line => line.isModified)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Table with editable rows */}
      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[400px] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('product')}
              >
                Product {getSortIcon('product')}
              </TableHead>
              <TableHead 
                className="w-[18%] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead className="w-[100px]">Sets Qty</TableHead>
              <TableHead 
                className="w-[22%] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('procedure')}
              >
                Category / Procedure {getSortIcon('procedure')}
              </TableHead>
              <TableHead 
                className="w-[15%] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('lifecycle')}
              >
                Life Cycle {getSortIcon('lifecycle')}
              </TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No products assigned to this country. Click "Add Product" to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedLines.map(line => {
                const product = getProduct(line.productId);
                const procedure = product ? getProcedure(product.procedureId) : undefined;
                const availableProducts = getAvailableProducts(line.id);
                
                return (
                  <TableRow key={line.id} className={line.isModified ? "bg-blue-50" : undefined}>
                    <TableCell>
                      {/* Product Selector */}
                      <Select
                        value={line.productId || "none"}
                        onValueChange={value => handleProductChange(line.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {line.productId === "" && <SelectItem value="none">Select...</SelectItem>}
                          
                          {availableProducts
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(product => {
                              const procedure = getProcedure(product.procedureId);
                              return (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {/* Status Selector - only enabled if product is selected */}
                      <Select
                        value={line.statusId || "none"}
                        onValueChange={value => handleStatusChange(line.id, value)}
                        disabled={!line.productId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                                            <SelectContent>
                      {line.statusId === "" && <SelectItem value="none">Select...</SelectItem>}
                      {statuses
                        .slice()
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
                        .map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: status.color }}
                              ></div>
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.setsQty || ''}
                        onChange={(e) => handleLineChange(line.id, 'setsQty', e.target.value)}
                        placeholder="Sets Qty"
                        type="text"
                        className="w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      {product && procedure ? (
                        <div>
                          <div className="font-medium">{procedure.category}</div>
                          <div className="text-sm text-muted-foreground">{procedure.name}</div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {product ? (
                        <div>{product.productLifeCycle}</div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => prepareRemoveLine(line.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Popup de confirmação para exclusão */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Product Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the product "{productToDelete?.productName}" from {countryName}? 
              This action cannot be undone and will permanently remove the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && confirmRemoveLine(productToDelete.lineId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
