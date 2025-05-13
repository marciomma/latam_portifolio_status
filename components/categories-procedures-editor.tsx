"use client";

import { useState, useEffect } from "react";
import { PortfolioService } from "@/services/portfolio-service";

type EditableCategory = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isNew?: boolean;
  isModified?: boolean;
  isSelected?: boolean;
  isExpanded?: boolean;
};

type EditableProcedure = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  isNew?: boolean;
  isModified?: boolean;
  isSelected?: boolean;
};

export function CategoriesProceduresEditor() {
  const [categories, setCategories] = useState<EditableCategory[]>([]);
  const [procedures, setProcedures] = useState<EditableProcedure[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const proceduresData = await PortfolioService.getProcedures();
        const uniqueCategories = Array.from(new Set(proceduresData.map((proc) => proc.category)));

        const categoriesData: EditableCategory[] = uniqueCategories.map((category, index) => ({
          id: `category-${index + 1}`,
          name: category,
          description: `Description for ${category}`,
          isActive: true,
          isModified: false,
          isSelected: false,
          isExpanded: false,
        }));

        const proceduresData2: EditableProcedure[] = proceduresData.map((procedure) => ({
          id: procedure.id,
          name: procedure.name,
          category: procedure.category,
          description: procedure.description || "",
          isActive: procedure.isActive,
          isModified: false,
          isSelected: false,
        }));

        setCategories(categoriesData);
        setProcedures(proceduresData2);
      } catch (error) {
        console.error("Erro ao carregar procedimentos do Redis:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editor de Categorias e Procedimentos</h2>
      <p>Componente em construção. Dados carregados do Redis com sucesso.</p>
    </div>
  );
}
