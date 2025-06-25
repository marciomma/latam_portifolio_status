import React, { useState, useEffect } from "react"
import { Check, Plus, Save, Trash2, ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Country } from "@/types/database"

// Extend Country type for UI state
type EditableCountry = Country & {
  isNew?: boolean
  isModified?: boolean
  isSelected?: boolean
}

export function CountriesEditor() {
  const [countries, setCountries] = useState<EditableCountry[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: 'name',
    direction: 'ascending'
  });

  // Função para carregar países - FIXED to use API route
  const loadCountries = async () => {
    try {
      setLoading(true);
      console.log("Loading countries...");
      
      // Fetch from API route instead of directly accessing Redis
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error(`Failed to load countries: ${response.status}`);
      }
      
      const countriesData = await response.json();
      console.log(`Loaded ${countriesData.length} countries`);
      
      const items: EditableCountry[] = countriesData.map((country: Country) => ({
        ...country,
        isModified: false,
        isSelected: false,
      }));
      
      // Ordenar os países carregados
      const sortedItems = sortCountries(items);
      setCountries(sortedItems);
      
      if (countriesData.length === 0) {
        setErrorMessage("No countries found. Add your first country.");
        setTimeout(() => setErrorMessage(""), 5000);
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error loading countries:", error);
      setErrorMessage(`Error loading countries: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar países na montagem do componente
  useEffect(() => {
    loadCountries();
  }, []);

  // Função para ordenar países
  const sortCountries = (countriesToSort: EditableCountry[]) => {
    return [...countriesToSort].sort((a, b) => {
      // Ordenar por nome
      return a.name.localeCompare(b.name);
    });
  };

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

  // Aplicar ordenação aos países
  const sortedCountries = React.useMemo(() => {
    if (sortConfig.direction === null) {
      return countries;
    }

         const sortableCountries = [...countries];
     sortableCountries.sort((a, b) => {
       switch(sortConfig.key) {
         case 'name':
           return sortConfig.direction === 'ascending' 
             ? a.name.localeCompare(b.name)
             : b.name.localeCompare(a.name);
         
         case 'code':
           return sortConfig.direction === 'ascending' 
             ? a.code.localeCompare(b.code)
             : b.code.localeCompare(a.code);
         
         case 'isActive':
           const statusA = a.isActive ? 'Active' : 'Inactive';
           const statusB = b.isActive ? 'Active' : 'Inactive';
           return sortConfig.direction === 'ascending' 
             ? statusA.localeCompare(statusB)
             : statusB.localeCompare(statusA);
         
         default:
           return 0;
       }
    });
    return sortableCountries;
  }, [countries, sortConfig]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      // Filtrar apenas países modificados ou novos
      const countriesToSave = countries.filter(c => c.isModified || c.isNew);
      
      if (countriesToSave.length === 0) {
        setSuccessMessage("No changes to save.");
        return;
      }
      
      console.log(`Sending ${countriesToSave.length} countries to save`);
      
             // Verificar se há campos em branco
       const invalidCountries = countriesToSave.filter(c => !c.name.trim() || !c.code.trim());
       
       if (invalidCountries.length > 0) {
         setErrorMessage("Cannot save. Country name and code are required for all countries.");
         return;
       }
      
             // Verificar duplicidade de nomes
       const names = countriesToSave.map(c => c.name.trim().toLowerCase());
       const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
       
       if (duplicateNames.length > 0) {
         setErrorMessage(`There are duplicate names among countries: ${[...new Set(duplicateNames)].join(', ')}`);
         return;
       }
       
       // Verificar duplicidade de códigos
       const codes = countriesToSave.map(c => c.code.trim().toUpperCase());
       const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
       
       if (duplicateCodes.length > 0) {
         setErrorMessage(`There are duplicate codes among countries: ${[...new Set(duplicateCodes)].join(', ')}`);
         return;
       }
       
       // Verificar duplicidade com países existentes (exceto o próprio país sendo editado)
       const existingNames = countries
         .filter(c => !countriesToSave.some(cts => cts.id === c.id))
         .map(c => c.name.trim().toLowerCase());
       
       const existingCodes = countries
         .filter(c => !countriesToSave.some(cts => cts.id === c.id))
         .map(c => c.code.trim().toUpperCase());
       
       const conflictingNames = countriesToSave.filter(c => 
         existingNames.includes(c.name.trim().toLowerCase())
       );
       
       const conflictingCodes = countriesToSave.filter(c => 
         existingCodes.includes(c.code.trim().toUpperCase())
       );
       
       if (conflictingNames.length > 0) {
         setErrorMessage(`Country names already exist: ${conflictingNames.map(c => c.name).join(', ')}`);
         return;
       }
       
       if (conflictingCodes.length > 0) {
         setErrorMessage(`Country codes already exist: ${conflictingCodes.map(c => c.code).join(', ')}`);
         return;
       }
      
             // Preparar dados para salvar
       const countriesToPost = countriesToSave.map(c => ({
         id: c.id,
         name: c.name.trim(),
         code: c.code.trim().toUpperCase(),
         hasTiers: c.hasTiers,
         numberOfTiers: c.numberOfTiers,
         isActive: c.isActive !== undefined ? c.isActive : true
       }));

      // Salvar via API - vou usar o endpoint de debug que tem melhor tratamento de erro
      const response = await fetch('/api/debug/countries/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countries: countriesToPost
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error saving countries');
      }
      
      if (result.success) {
        // Recarregar dados para garantir consistência
        await loadCountries();
        setSuccessMessage(`${countriesToSave.length} countries saved successfully! Total of ${result.totalCountries} countries in database.`);
      } else {
        throw new Error(result.message || 'Unknown error saving countries');
      }
    } catch (error) {
      console.error('Error saving countries:', error);
      setErrorMessage(`Error saving: ${error instanceof Error ? error.message : String(error)}`);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  }

     // Função para alterar valores do país
   const handleCountryChange = (countryId: string, field: keyof EditableCountry, value: string | boolean | number) => {
     // Verificação especial para o campo 'name' para evitar duplicidade
     if (field === 'name') {
       value = String(value); // Não aplicar trim aqui para permitir espaços durante digitação
       
       const lowerCaseValue = value.trim().toLowerCase(); // Aplicar trim apenas para comparação
       
       // Só verificar duplicidade se há conteúdo útil (após trim)
       if (lowerCaseValue) {
         // Checar se já existe outro país com esse nome
         const duplicateCountry = countries.find(c => 
           c.id !== countryId && c.name.trim().toLowerCase() === lowerCaseValue
         );
         
         if (duplicateCountry) {
           setErrorMessage(`Duplicate name: "${value.trim()}" is already being used by another country.`);
           setTimeout(() => setErrorMessage(""), 5000);
           return;
         } else {
           setErrorMessage(""); // Limpar erro se não há duplicata
         }
       } else {
         setErrorMessage(""); // Limpar erro se campo está vazio
       }
     }
     
     // Verificação especial para o campo 'code' para evitar duplicidade
     if (field === 'code') {
       value = String(value).toUpperCase(); // Aplicar toUpperCase para visualização, mas não trim durante digitação
       
       const normalizedCode = value.trim(); // Aplicar trim apenas para comparação
       
       // Só verificar duplicidade se há conteúdo útil (após trim)
       if (normalizedCode) {
         // Checar se já existe outro país com esse código
         const duplicateCountryCode = countries.find(c => 
           c.id !== countryId && c.code.trim().toUpperCase() === normalizedCode
         );
         
         if (duplicateCountryCode) {
           setErrorMessage(`Duplicate code: "${normalizedCode}" is already being used by another country.`);
           setTimeout(() => setErrorMessage(""), 5000);
           return;
         } else {
           setErrorMessage(""); // Limpar erro se não há duplicata
         }
       } else {
         setErrorMessage(""); // Limpar erro se campo está vazio
       }
     }
    
    setCountries(prevCountries => 
      prevCountries.map(country => 
        country.id === countryId 
          ? { ...country, [field]: value, isModified: true } 
          : country
      )
    );
  };

  // Função para selecionar/deselecionar país
  const handleSelectCountry = (countryId: string, selected: boolean) => {
    setSelectedCountries(prev => 
      selected 
        ? [...prev, countryId] 
        : prev.filter(id => id !== countryId)
    );
  };

  // Verificar se todos os países ordenados estão selecionados
  const allSelected = sortedCountries.length > 0 && 
                     sortedCountries.every(country => selectedCountries.includes(country.id));

  // Função para selecionar/deselecionar todos os países
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const sortedCountryIds = sortedCountries
        .map(country => country.id);
      
      setSelectedCountries(sortedCountryIds);
    } else {
      setSelectedCountries([]);
    }
  };

  // Função para adicionar um novo país na tabela
  const handleAddCountry = () => {
    const countryId = `country-${Date.now()}`;
    
    // Criar um país vazio
    const newCountryItem: EditableCountry = {
      id: countryId,
      name: "",
      code: "", // Código do país (BR, CO, MX, etc.)
      hasTiers: false, // Padrão sem tiers
      numberOfTiers: 1, // Padrão um tier
      isActive: true,
      isNew: true,
      isModified: true,
      isSelected: false
    };

    // Adicionar ao início da lista de países
    setCountries(prev => [newCountryItem, ...prev]);
    
    // Mostrar mensagem
    setSuccessMessage("New row added. Fill in the country name and save to complete.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Função para excluir países selecionados
  const handleDeleteSelected = async () => {
    if (selectedCountries.length === 0) return;
    
    try {
      setLoading(true);
      // Chamar a API para excluir países
      const response = await fetch(`/api/countries?ids=${selectedCountries.join(',')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Deletion result:', result);
      
      // Remover países do estado local
      setCountries(prev => prev.filter(country => !selectedCountries.includes(country.id)));
      setSelectedCountries([]);
      
      // Mostrar mensagem de sucesso
      setSuccessMessage(`${selectedCountries.length} country(ies) deleted successfully!`);
      
      // Recarregar dados para garantir consistência
      await loadCountries();
    } catch (error) {
      console.error('Error deleting countries:', error);
      setErrorMessage(`Error deleting: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-6 mb-6 flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddCountry} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
            disabled={selectedCountries.length === 0 || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          {(countries.some((item) => item.isModified) || countries.some((item) => item.isNew)) && (
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

      <div className="mb-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={allSelected && sortedCountries.length > 0} 
                  onCheckedChange={handleSelectAll}
                  disabled={sortedCountries.length === 0}
                />
              </TableHead>
                             <TableHead 
                 className="cursor-pointer hover:bg-slate-50" 
                 onClick={() => requestSort('name')}
               >
                 Country Name {getSortIcon('name')}
               </TableHead>
               <TableHead 
                 className="w-[120px] cursor-pointer hover:bg-slate-50" 
                 onClick={() => requestSort('code')}
               >
                 Code {getSortIcon('code')}
               </TableHead>
               <TableHead 
                 className="w-[200px] cursor-pointer hover:bg-slate-50" 
                 onClick={() => requestSort('isActive')}
               >
                 Status {getSortIcon('isActive')}
               </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCountries.length > 0 ? (
              sortedCountries.map((country) => {
                return (
                  <TableRow 
                    key={country.id}
                    className={country.isNew ? "bg-blue-50" : country.isModified ? "bg-yellow-50" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedCountries.includes(country.id)} 
                        onCheckedChange={(checked) => handleSelectCountry(country.id, !!checked)}
                      />
                    </TableCell>
                                         <TableCell>
                       <Input 
                         value={country.name} 
                         onChange={(e) => handleCountryChange(country.id, 'name', e.target.value)}
                         placeholder="Enter country name"
                       />
                     </TableCell>
                     <TableCell>
                       <Input 
                         value={country.code} 
                         onChange={(e) => handleCountryChange(country.id, 'code', e.target.value)}
                         placeholder="BR, CO, MX..."
                         maxLength={5}
                       />
                     </TableCell>
                     <TableCell>
                       <Select 
                         value={country.isActive ? "active" : "inactive"} 
                         onValueChange={(value) => handleCountryChange(country.id, 'isActive', value === "active")}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select status" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="active">Active</SelectItem>
                           <SelectItem value="inactive">Inactive</SelectItem>
                         </SelectContent>
                       </Select>
                     </TableCell>
                  </TableRow>
                );
              })
            ) : (
                             <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center">
                   No countries found. Add a new country to get started.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 