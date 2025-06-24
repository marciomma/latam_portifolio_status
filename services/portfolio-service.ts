import { getFromRedis, setToRedis } from '@/lib/data'

import type {
  Procedure,
  Country,
  ProductType,
  Product,
  Status,
  PortfolioStatusView,
  StatusPortfolio,
} from '@/types/database'

export class PortfolioService {
  static async getProcedures(): Promise<Procedure[]> {
    // Get procedures and ensure view is updated with current procedure data
    const procedures = await getFromRedis<Procedure>('procedures');
    
    // Refresh the view data to ensure it's using current procedure categories
    this.rebuildPortfolioStatusView();
    
    return procedures;
  }

  static async getCountries(): Promise<Country[]> {
    return await getFromRedis<Country>('countries')
  }

  static async getProductTypes(): Promise<ProductType[]> {
    return await getFromRedis<ProductType>('productTypes')
  }

  static async getProducts(): Promise<Product[]> {
    return await getFromRedis<Product>('products')
  }

  static async getStatuses(): Promise<Status[]> {
    const statuses = await getFromRedis<Status>('statuses');
    
    // Ensure "Ready to be Ordered" status exists
    const readyToOrderStatus = statuses.find(
      status => status.name === "Ready to be Ordered" || status.code === "AVAILABLE_TO_ORDER"
    );
    
    if (!readyToOrderStatus) {
      // Add the new status automatically
      const newStatus: Status = {
        id: `status-available-to-order-${Date.now()}`,
        code: "AVAILABLE_TO_ORDER",
        name: "Ready to be Ordered",
        color: "#FFA500", // Orange color
        description: "Product is ready to be ordered",
        isActive: true
      };
      
      const updatedStatuses = [...statuses, newStatus];
      
      // Save back to Redis
      try {
        await setToRedis('statuses', updatedStatuses);
        console.log('✅ Added "Ready to be Ordered" status automatically');
        return updatedStatuses;
      } catch (error) {
        console.error('Failed to add "Ready to be Ordered" status:', error);
        return statuses;
      }
    }
    
    return statuses;
  }

  static async getStatusPortfolios(): Promise<StatusPortfolio[]> {
    return await getFromRedis<StatusPortfolio>('statusPortfolios')
  }

  static async getPortfolioStatusView(): Promise<PortfolioStatusView[]> {
    return await getFromRedis<PortfolioStatusView>('portfolioStatusView')
  }

  static async getProductsByProcedure(procedureId: string): Promise<Product[]> {
    const products = await this.getProducts()
    return products.filter((p) => p.procedureId === procedureId)
  }

  static async getPortfolioStatusViewByCountry(countryId: string): Promise<PortfolioStatusView[]> {
    const full = await this.getPortfolioStatusView()
    return full.map((item) => ({
      ...item,
      countryStatuses: item.countryStatuses.filter((cs) => cs.countryId === countryId),
    }))
  }

  // Rebuild the portfolio status view from scratch to ensure category and procedure data is current
  static async rebuildPortfolioStatusView(): Promise<boolean> {
    try {
      console.log('Rebuilding PortfolioStatusView with current procedure data');
      
      // Get all required data directly from Redis to avoid recursion
      const statusPortfolios = await getFromRedis<StatusPortfolio>('statusPortfolios');
      const products = await getFromRedis<Product>('products');
      const procedures = await getFromRedis<Procedure>('procedures');
      const productTypes = await getFromRedis<ProductType>('productTypes');
      const statuses = await getFromRedis<Status>('statuses');
      const countries = await getFromRedis<Country>('countries');
      
      // Build a new view from scratch
      const newView: PortfolioStatusView[] = [];
      
      // Process each product
      for (const product of products) {
        // Skip inactive products
        if (!product.isActive) continue;
        
        // Find related data
        const procedure = procedures.find(p => p.id === product.procedureId);
        const productType = productTypes.find(pt => pt.id === product.productTypeId);
        
        // Skip if procedure or product type is missing
        if (!procedure || !productType) {
          console.warn(`Missing procedure or product type for product ${product.name} (ID: ${product.id})`);
          continue;
        }
        
        // Find statuses for this product
        const productStatuses = statusPortfolios.filter(sp => sp.productId === product.id);
        
        // Create the country status entries
        const countryStatuses = productStatuses.map(ps => {
          const country = countries.find(c => c.id === ps.countryId);
          const status = statuses.find(s => s.id === ps.statusId);
          
          if (!country || !status) return null;
          
          return {
            countryId: country.id,
            countryName: country.name,
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            setsQty: ps.setsQty,
            lastUpdated: ps.lastUpdated
          };
        }).filter((status): status is NonNullable<typeof status> => status !== null);
        
        // Create the view entry
        newView.push({
          id: `view-${product.id}`,
          category: procedure.category,
          procedure: procedure.name,
          procedureId: procedure.id,
          productType: productType.name,
          productTypeId: productType.id,
          product: product.name,
          productId: product.id,
          productTier: product.productTier,
          productLifeCycle: product.productLifeCycle,
          countryStatuses,
        });
      }
      
      // Save the updated view - use JSON.stringify explicitly to ensure we're passing a string to Redis
      // to avoid the "tipo retornado não é string, é 'object'" error
      try {
        await setToRedis('portfolioStatusView', newView);
        console.log(`PortfolioStatusView rebuilt with ${newView.length} products`);
        return true;
      } catch (error) {
        console.error('Error saving rebuilt portfolio view to Redis:', error);
        return false;
      }
    } catch (error) {
      console.error('Error rebuilding portfolio status view:', error);
      return false;
    }
  }

  // Atualiza o status de um produto para um país
  static async updateStatus(productId: string, countryId: string, statusId: string, setsQty?: string, notes?: string): Promise<boolean> {
    try {
      console.log(`Atualizando produto ${productId} em ${countryId} para status ${statusId}`)
      
      // 1. Buscar os dados atuais
      const statusPortfolios = await this.getStatusPortfolios()
      const portfolioView = await this.getPortfolioStatusView()
      
      // 2. Atualizar statusPortfolios - onde os dados realmente são armazenados
      const existingStatusIndex = statusPortfolios.findIndex(
        sp => sp.productId === productId && sp.countryId === countryId
      )
      
      if (existingStatusIndex >= 0) {
        // Atualizar registro existente
        statusPortfolios[existingStatusIndex] = {
          ...statusPortfolios[existingStatusIndex],
          statusId: statusId,
          setsQty: setsQty,
          notes: notes || statusPortfolios[existingStatusIndex].notes,
          lastUpdated: new Date().toISOString()
        }
      } else {
        // Criar novo registro
        statusPortfolios.push({
          id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          productId,
          countryId,
          statusId,
          setsQty,
          notes: notes || '',
          lastUpdated: new Date().toISOString()
        })
      }
      
      // 3. Atualizar a view para refletir as mudanças
      const product = portfolioView.find(pv => pv.productId === productId)
      if (product) {
        const countryStatusIndex = product.countryStatuses.findIndex(
          cs => cs.countryId === countryId
        )
        
        if (countryStatusIndex >= 0) {
          // Atualizar status existente na view
          product.countryStatuses[countryStatusIndex].statusId = statusId
          product.countryStatuses[countryStatusIndex].setsQty = setsQty
          product.countryStatuses[countryStatusIndex].lastUpdated = new Date().toISOString()
        }
      }
      
      // 4. Persistir as alterações no Redis
      await setToRedis('statusPortfolios', statusPortfolios)
      await setToRedis('portfolioStatusView', portfolioView)
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      return false
    }
  }

  static async bulkUpdateStatus(updates: { productId: string, countryId: string, statusId: string, setsQty?: string, notes?: string }[]): Promise<boolean> {
    try {
      // 1. Buscar os dados atuais uma única vez para melhor performance
      const statusPortfolios = await this.getStatusPortfolios()
      const portfolioView = await this.getPortfolioStatusView()
      const statuses = await this.getStatuses()
      const countries = await this.getCountries()
      const products = await this.getProducts()
      const procedures = await this.getProcedures()
      const productTypes = await this.getProductTypes()
      
      let hasChanges = false
      
      console.log(`Atualizando ${updates.length} registros`);
      
      // 2. Aplicar todas as atualizações em memória primeiro
      for (const update of updates) {
        console.log(`Processando atualização: produto ${update.productId} em ${update.countryId} para status ${update.statusId || "[EXCLUIR]"}`);
        
        // Verificar se é uma exclusão (statusId vazio)
        if (!update.statusId) {
          // Excluir o status para este produto/país
          const indexToRemove = statusPortfolios.findIndex(
            sp => sp.productId === update.productId && sp.countryId === update.countryId
          );
          
          if (indexToRemove !== -1) {
            console.log(`Removendo status para produto ${update.productId} em ${update.countryId}`);
            statusPortfolios.splice(indexToRemove, 1);
            
            // Atualizar a view para remover este status
            const product = portfolioView.find(pv => pv.productId === update.productId);
            if (product) {
              const countryStatusIndex = product.countryStatuses.findIndex(
                cs => cs.countryId === update.countryId
              );
              
              if (countryStatusIndex !== -1) {
                product.countryStatuses.splice(countryStatusIndex, 1);
              }
            }
            
            hasChanges = true;
          }
          
          continue; // Pular para o próximo update
        }
        
        // Não é exclusão, continuar com o fluxo normal de update/create
        
        // Atualizar statusPortfolios
        const existingStatusIndex = statusPortfolios.findIndex(
          sp => sp.productId === update.productId && sp.countryId === update.countryId
        )
        
        if (existingStatusIndex >= 0) {
          statusPortfolios[existingStatusIndex] = {
            ...statusPortfolios[existingStatusIndex],
            statusId: update.statusId,
            setsQty: update.setsQty,
            notes: update.notes || statusPortfolios[existingStatusIndex].notes,
            lastUpdated: new Date().toISOString()
          }
        } else {
          statusPortfolios.push({
            id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            productId: update.productId,
            countryId: update.countryId,
            statusId: update.statusId,
            setsQty: update.setsQty,
            notes: update.notes || '',
            lastUpdated: new Date().toISOString()
          })
        }
        
        // Buscar informações necessárias
        const productDetail = products.find(p => p.id === update.productId);
        const status = statuses.find(s => s.id === update.statusId);
        const country = countries.find(c => c.id === update.countryId);
        
        if (!productDetail || !status || !country) {
          console.error(`Dados incompletos: produto=${!!productDetail}, status=${!!status}, país=${!!country}`);
          continue; // Pular esta atualização se estiverem faltando dados
        }
        
        // Encontrar ou criar entrada na view
        let product = portfolioView.find(pv => pv.productId === update.productId);
        
        if (!product) {
          // Se o produto não existe na view, criar um novo
          const productType = productTypes.find(t => t.id === productDetail.productTypeId);
          const procedure = procedures.find(p => p.id === productDetail.procedureId);
          
          if (!productType || !procedure) {
            console.error(`Tipo de produto ou procedimento não encontrado para o produto ${productDetail.name}`);
            continue;
          }
          
          product = {
            id: `view-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            category: procedure.category,
            procedure: procedure.name,
            procedureId: procedure.id,
            productType: productType.name,
            productTypeId: productType.id,
            product: productDetail.name,
            productId: productDetail.id,
            productTier: productDetail.productTier,
            productLifeCycle: productDetail.productLifeCycle,
            countryStatuses: []
          };
          
          portfolioView.push(product);
        }
        
        // Atualizar os status do país para este produto
        const countryStatusIndex = product.countryStatuses.findIndex(
          cs => cs.countryId === update.countryId
        );
        
        if (countryStatusIndex >= 0) {
          // Atualizar status existente
          product.countryStatuses[countryStatusIndex] = {
            countryId: country.id,
            countryName: country.name,
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            setsQty: update.setsQty,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Adicionar novo status para o país
          product.countryStatuses.push({
            countryId: country.id,
            countryName: country.name,
            statusId: status.id,
            statusCode: status.code,
            statusName: status.name,
            statusColor: status.color,
            setsQty: update.setsQty,
            lastUpdated: new Date().toISOString()
          });
        }
        
        hasChanges = true;
      }
      
      // 3. Persistir todas as alterações de uma vez no Redis
      if (hasChanges) {
        console.log(`Salvando ${statusPortfolios.length} status e ${portfolioView.length} itens de view no Redis`);
        await Promise.all([
          setToRedis('statusPortfolios', statusPortfolios),
          setToRedis('portfolioStatusView', portfolioView)
        ]);
        
        // Adicionar uma marca de tempo para indicar a última atualização
        await setToRedis('lastUpdate', [Date.now().toString()]);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status em lote:', error);
      return false;
    }
  }
  
  // Método para limpar o cache e forçar a recarga dos dados
  static async refreshCache(): Promise<boolean> {
    try {
      // Forçar a recarga dos dados no próximo acesso
      await setToRedis('lastUpdate', [Date.now().toString()]);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar o cache:', error);
      return false;
    }
  }
}
