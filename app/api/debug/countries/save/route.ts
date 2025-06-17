import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { PortfolioService } from "@/services/portfolio-service";
import type { Country } from "@/types/database";

// POST - Salvar países modificados
export async function POST(req: Request) {
  try {
    const { countries } = await req.json();
    
    if (!Array.isArray(countries)) {
      return NextResponse.json(
        { error: "Formato inválido. Esperado um array de países." },
        { status: 400 }
      );
    }
    
    console.log(`[API] Recebido ${countries.length} países para atualizar/adicionar`);
    
    // Verificar nomes duplicados entre os novos países
    const countryNames = countries.map(c => c.name.trim().toLowerCase());
    const uniqueNames = new Set(countryNames);
    
    if (uniqueNames.size !== countryNames.length) {
      const duplicates = countryNames.filter((name, index) => 
        countryNames.indexOf(name) !== index
      );
      
      return NextResponse.json(
        { 
          error: "Nomes de países duplicados", 
          message: `Os seguintes nomes estão duplicados: ${[...new Set(duplicates)].join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Verificar códigos duplicados entre os novos países
    const countryCodes = countries.map(c => c.code.trim().toUpperCase());
    const uniqueCodes = new Set(countryCodes);
    
    if (uniqueCodes.size !== countryCodes.length) {
      const duplicates = countryCodes.filter((code, index) => 
        countryCodes.indexOf(code) !== index
      );
      
      return NextResponse.json(
        { 
          error: "Códigos de países duplicados", 
          message: `Os seguintes códigos estão duplicados: ${[...new Set(duplicates)].join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Buscar países existentes
    const existingCountries = await PortfolioService.getCountries();
    console.log(`[API] Existem atualmente ${existingCountries.length} países no banco`);
    
    // Verificar duplicidade com países existentes 
    // (exceto se for o mesmo país sendo atualizado)
    const existingIds = new Set(existingCountries.map(c => c.id));
    
    for (const country of countries) {
      // Se não estiver atualizando um país existente, verificar duplicidade de nome e código
      if (!existingIds.has(country.id)) {
        const duplicateName = existingCountries.find(
          c => c.name.trim().toLowerCase() === country.name.trim().toLowerCase()
        );
        
        const duplicateCode = existingCountries.find(
          c => c.code.trim().toUpperCase() === country.code.trim().toUpperCase()
        );
        
        if (duplicateName) {
          return NextResponse.json(
            { 
              error: "Nome de país duplicado", 
              message: `O nome "${country.name}" já existe no banco de dados` 
            },
            { status: 400 }
          );
        }
        
        if (duplicateCode) {
          return NextResponse.json(
            { 
              error: "Código de país duplicado", 
              message: `O código "${country.code}" já existe no banco de dados` 
            },
            { status: 400 }
          );
        }
      }
    }
    
    // Verificar que todos os países têm os campos necessários
    const invalidCountries = countries.filter(
      c => !c.id || !c.name.trim() || !c.code.trim()
    );
    
    if (invalidCountries.length > 0) {
      return NextResponse.json(
        { 
          error: "Países inválidos", 
          message: `${invalidCountries.length} país(es) não possuem todos os campos obrigatórios (id, name, code)` 
        },
        { status: 400 }
      );
    }
    
    // Mesclar países novos/modificados com existentes
    const countryMap = new Map<string, Country>();
    
    // Adicionar países existentes
    existingCountries.forEach(country => {
      countryMap.set(country.id, country);
    });
    
    // Atualizar/adicionar países modificados
    countries.forEach(country => {
      // Garantir que o código seja maiúsculo
      country.code = country.code.trim().toUpperCase();
      countryMap.set(country.id, country);
    });
    
    // Converter de volta para array
    const updatedCountries = Array.from(countryMap.values());
    console.log(`[API] Total de ${updatedCountries.length} países após mesclagem`);
    
    // Salvar no Redis, garantindo que seja armazenado como string JSON
    await redis.del('countries');
    const jsonString = JSON.stringify(updatedCountries);
    const result = await redis.set('countries', jsonString);
    
    // Verificar se os dados foram salvos corretamente
    const verification = await redis.get('countries');
    let savedCount = 0;
    
    if (Array.isArray(verification)) {
      savedCount = verification.length;
      console.log(`[API] Verificação: Redis retornou ${savedCount} países como array`);
    } else if (typeof verification === 'string') {
      try {
        const parsed = JSON.parse(verification);
        if (Array.isArray(parsed)) {
          savedCount = parsed.length;
          console.log(`[API] Verificação: Redis retornou ${savedCount} países como string JSON`);
        }
      } catch (error) {
        console.error('[API] Erro ao verificar dados salvos:', error);
      }
    }
    
    if (savedCount !== updatedCountries.length) {
      console.error(`[API] Anomalia na verificação: esperava ${updatedCountries.length} países, encontrou ${savedCount}`);
    }
    
    return NextResponse.json({
      success: true,
      message: `${countries.length} país(es) salvo(s) com sucesso`,
      totalCountries: updatedCountries.length,
      savedCountries: savedCount
    });
  } catch (error) {
    console.error('[API] Erro ao salvar países:', error);
    return NextResponse.json(
      { success: false, error: "Falha ao salvar países", message: String(error) },
      { status: 500 }
    );
  }
} 