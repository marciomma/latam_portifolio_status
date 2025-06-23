import { useState, useCallback } from 'react';

interface PortfolioData {
  countries: any[];
  portfolioData: any[];
  procedures: any[];
  productTypes: any[];
  statuses: any[];
  products: any[];
}

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/load-dashboard-data?_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback(async () => {
    // Optimistically update or refetch data
    return fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    mutate, // Use this instead of window.location.reload()
    fetchData,
  };
}

// Hook for updating status with optimistic updates
export function useUpdateStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateStatus = useCallback(async (updates: any[]) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateStatus,
    isUpdating,
  };
} 