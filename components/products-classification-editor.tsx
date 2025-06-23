"use client";

import React, { useState, useEffect } from "react";
import { Check, Plus, Save, Trash2, X, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PortfolioService } from "@/services/portfolio-service";
import type { Procedure } from "@/types/database";

type EditableCategory = {
  id: string;
  name: string;
  isActive: boolean;
  isNew?: boolean;
  isModified?: boolean;
  isSelected?: boolean;
};

type EditableProcedure = {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  isNew?: boolean;
  isModified?: boolean;
  isSelected?: boolean;
};

export function ProductsClassificationEditor() {
  const [categories, setCategories] = useState<EditableCategory[]>([]);
  const [procedures, setProcedures] = useState<EditableProcedure[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: 'category',
    direction: 'ascending'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch from API route instead of directly accessing Redis
      const response = await fetch('/api/procedures');
      if (!response.ok) {
        throw new Error(`Failed to load procedures: ${response.status}`);
      }
      
      const proceduresData = await response.json();
      
      // Extract unique categories from procedures
      const uniqueCategories = Array.from(new Set(proceduresData.map((proc: any) => proc.category)));

      const categoriesData: EditableCategory[] = uniqueCategories.map((category) => {
        // Generate a stable ID based on the category name
        const categoryId = `category-${(category as string).toLowerCase().replace(/\s+/g, '-')}`;
        
        return {
          id: categoryId,
          name: category as string,
          isActive: true,
          isModified: false,
          isSelected: false,
        }
      });

      const proceduresData2: EditableProcedure[] = proceduresData.map((procedure: any) => ({
        id: procedure.id,
        name: procedure.name,
        category: procedure.category,
        isActive: procedure.isActive,
        isModified: false,
        isSelected: false,
      }));

      setCategories(categoriesData);
      setProcedures(proceduresData2);
      setErrorMessage("");
    } catch (error) {
      console.error("Error loading procedures:", error);
      setErrorMessage(`Error loading data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      
      // Filter only modified or new procedures
      const proceduresToSave = procedures.filter(p => p.isModified || p.isNew);
      
      if (proceduresToSave.length === 0) {
        setSuccessMessage("No changes to save.");
        return;
      }
      
      console.log(`Saving ${proceduresToSave.length} procedures`);
      
      // Check for duplicate names
      const names = proceduresToSave.map(p => p.name.trim().toLowerCase());
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      
      if (duplicateNames.length > 0) {
        setErrorMessage(`Duplicate procedure names found: ${[...new Set(duplicateNames)].join(', ')}`);
        return;
      }
      
      // Prepare data for saving
      const proceduresToUpdate = proceduresToSave.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        isActive: p.isActive === undefined ? true : p.isActive
      }));
      
      // Use the fetch API to save procedures
      const response = await fetch('/api/debug/procedures/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ procedures: proceduresToUpdate }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Reload data to ensure consistency
        await loadData();
        setSuccessMessage(`${proceduresToSave.length} procedures saved successfully! Total: ${result.totalProcedures || 'N/A'} procedures.`);
      } else {
        throw new Error(result.message || 'Unknown error while saving procedures');
      }
    } catch (error) {
      console.error('Error saving procedures:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleProcedureChange = (procedureId: string, field: keyof EditableProcedure, value: any) => {
    // Special check for the 'name' field to avoid duplicates
    if (field === 'name') {
      const lowerCaseValue = String(value).trim().toLowerCase();
      
      const duplicate = procedures.find(p => 
        p.id !== procedureId && p.name.trim().toLowerCase() === lowerCaseValue
      );
      
      if (duplicate) {
        setErrorMessage(`Duplicate name: "${value}" is already used by another procedure.`);
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
    }
    
    setProcedures(prev => 
      prev.map(procedure => 
        procedure.id === procedureId 
          ? { ...procedure, [field]: value, isModified: true } 
          : procedure
      )
    );
  };

  const handleSelectProcedure = (procedureId: string, selected: boolean) => {
    setSelectedProcedures(prev => 
      selected 
        ? [...prev, procedureId] 
        : prev.filter(id => id !== procedureId)
    );
  };



  const handleAddProcedure = () => {
    const procedureId = `procedure-${Date.now()}`;
    
    // Default values based on current filter
    const defaultCategory = categoryFilter !== "all" ? categoryFilter :
                           categories.length > 0 ? categories[0].name : "CERVICAL";
    
    // Create a default name for the new procedure
    let defaultName = `New ${defaultCategory} Procedure`;
    let counter = 1;
    
    // Check if name already exists (case insensitive)
    while (procedures.some(p => p.name.toLowerCase() === defaultName.toLowerCase())) {
      defaultName = `New ${defaultCategory} Procedure ${counter}`;
      counter++;
    }
    
    const newProcedure: EditableProcedure = {
      id: procedureId,
      name: defaultName,
      category: defaultCategory,
      isActive: true,
      isNew: true,
      isModified: true,
      isSelected: false
    };

    setProcedures(prev => [...prev, newProcedure]);
    
    setSuccessMessage("New procedure added. Edit the details as needed and save to complete.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleShowAddCategory = () => {
    setIsAddingCategory(true);
    setNewCategoryName("");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setErrorMessage("Category name cannot be empty");
      return;
    }
    
    // Check if category already exists (case insensitive)
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setErrorMessage(`Category "${newCategoryName}" already exists`);
      return;
    }
    
    const newCategory: EditableCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName.trim(),
      isActive: true,
      isNew: true,
      isModified: true,
      isSelected: false
    };

    setCategories(prev => [...prev, newCategory]);
    setCategoryFilter(newCategory.name);
    
    setSuccessMessage(`Category "${newCategory.name}" added. Add procedures to this category as needed.`);
    setTimeout(() => setSuccessMessage(""), 3000);
    
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  const handleDeleteSelected = async () => {
    if (selectedProcedures.length === 0) return;
    
    try {
      // Call API to delete procedures
      const response = await fetch(`/api/procedures?ids=${selectedProcedures.join(',')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete result:', result);
      
      // Remove procedures from local state
      setProcedures(prev => prev.filter(procedure => !selectedProcedures.includes(procedure.id)));
      setSelectedProcedures([]);
      
      // Show success message
      setSuccessMessage(`${selectedProcedures.length} procedure(s) deleted successfully!`);
      
      // Clean up any categories that no longer have procedures
      const remainingCategories = new Set(procedures
        .filter(p => !selectedProcedures.includes(p.id))
        .map(p => p.category));
        
      setCategories(prev => prev.filter(c => remainingCategories.has(c.name)));
      
      setTimeout(() => {
        loadData(); // Reload to ensure consistency
      }, 2000);
    } catch (error) {
      console.error('Error deleting procedures:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setErrorMessage(""), 3000);
    }
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

  // Filter procedures based on selected category
  const filteredProcedures = procedures.filter(procedure => 
    categoryFilter === "all" || procedure.category === categoryFilter
  );

  // Aplicar ordenação aos procedimentos filtrados
  const sortedProcedures = React.useMemo(() => {
    if (sortConfig.direction === null) {
      return filteredProcedures;
    }

    const sortableProcedures = [...filteredProcedures];
    sortableProcedures.sort((a, b) => {
      switch(sortConfig.key) {
        case 'category':
          return sortConfig.direction === 'ascending' 
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        
        case 'name':
          return sortConfig.direction === 'ascending' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        
        case 'status':
          const statusA = a.isActive ? 'Active' : 'Inactive';
          const statusB = b.isActive ? 'Active' : 'Inactive';
          return sortConfig.direction === 'ascending' 
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        
        default:
          return 0;
      }
    });
    return sortableProcedures;
  }, [filteredProcedures, sortConfig]);

  // Check if all procedures are selected
  const allSelected = sortedProcedures.length > 0 && 
                     sortedProcedures.every(procedure => selectedProcedures.includes(procedure.id));

  // Função para selecionar/deselecionar todos os procedimentos
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const sortedProcedureIds = sortedProcedures.map(p => p.id);
      setSelectedProcedures(sortedProcedureIds);
    } else {
      setSelectedProcedures([]);
    }
  };

  return (
    <div>
      <div className="mt-6 mb-6 flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShowAddCategory} disabled={loading || isAddingCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button variant="outline" onClick={handleAddProcedure} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Procedure
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
            disabled={selectedProcedures.length === 0 || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      {isAddingCategory && (
        <Card className="mb-6 border-blue-500">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add New Category</h3>
                <Button variant="ghost" size="sm" onClick={handleCancelAddCategory}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1"
                />
                <Button onClick={handleAddCategory}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="font-medium">Filter by Category:</div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={categoryFilter === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setCategoryFilter("all")}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={categoryFilter === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={allSelected && sortedProcedures.length > 0} 
                  onCheckedChange={handleSelectAll}
                  disabled={sortedProcedures.length === 0}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('category')}
              >
                Category {getSortIcon('category')}
              </TableHead>
              <TableHead 
                className="w-[600px] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('name')}
              >
                Procedure Name {getSortIcon('name')}
              </TableHead>
              <TableHead 
                className="w-[200px] cursor-pointer hover:bg-slate-50" 
                onClick={() => requestSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProcedures.length > 0 ? (
              sortedProcedures.map((procedure) => (
                <TableRow 
                  key={procedure.id}
                  className={procedure.isNew ? "bg-blue-50" : procedure.isModified ? "bg-yellow-50" : ""}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedProcedures.includes(procedure.id)} 
                      onCheckedChange={(checked) => handleSelectProcedure(procedure.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={procedure.category} 
                      onChange={(e) => handleProcedureChange(procedure.id, 'category', e.target.value)}
                    >
                      {categories
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={procedure.name} 
                      onChange={(e) => handleProcedureChange(procedure.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={procedure.isActive ? "active" : "inactive"} 
                      onChange={(e) => handleProcedureChange(procedure.id, 'isActive', e.target.value === "active")}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {categoryFilter !== "all" 
                    ? "No procedures found for this category. Add a new procedure."
                    : "No procedures found. Add your first procedure."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(procedures.some((item) => item.isModified) || procedures.some((item) => item.isNew)) && (
        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      )}
    </div>
  );
}
