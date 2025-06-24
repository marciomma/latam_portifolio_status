"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [cleanupMessage, setCleanupMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const cleanupDatabase = async () => {
    try {
      const confirmed = window.confirm("This will remove legacy mockup data from the database. Continue?")
      if (!confirmed) return

      setIsLoading(true)
      setCleanupMessage("Cleaning database...")
      
      const response = await fetch('/api/clean-portfolio-data', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCleanupMessage(result.message)
        
        // Clear the message after showing success
        setTimeout(() => {
          setCleanupMessage("")
          // Optionally navigate to the main page if needed
          // router.push('/')
        }, 3000)
        
        // Clear any cached data by calling the cache invalidation endpoint
        try {
          await fetch('/api/load-dashboard-data', { method: 'POST' })
        } catch (err) {
          console.log('Cache cleared')
        }
      } else {
        setCleanupMessage(`Error: ${result.message}`)
        setTimeout(() => setCleanupMessage(""), 5000)
      }
    } catch (error) {
      setCleanupMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setTimeout(() => setCleanupMessage(""), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Ferramentas administrativas para o sistema de Portfolio Status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Links Rápidos</h2>
          <div className="space-y-2">
            <Link 
              href="/"
              className="text-blue-600 hover:underline block"
            >
              Página Inicial
            </Link>
            <Link 
              href="/country-status"
              className="text-blue-600 hover:underline block"
            >
              Editor de Status por País
            </Link>
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Sistema</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Cache: 30 segundos TTL</p>
            <p>Redis: Otimizado com retry</p>
            <p>Build: Turbopack habilitado</p>
          </div>
        </div>
      </div>

      <div className="mb-8 border-t pt-4">
        <h2 className="text-lg font-medium mb-3">Administração do Banco de Dados</h2>
        
        <details className="text-sm border rounded-lg p-4">
          <summary className="cursor-pointer text-red-600 font-medium">Limpeza de Dados Legados (Cuidado!)</summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <p className="mb-4 text-sm text-gray-700">
              Esta operação removerá dados legados do mockup inicial e resolverá problemas
              de itens excluídos que continuam aparecendo depois de salvos. Use apenas
              se estiver enfrentando problemas com o editor de países.
            </p>
            <button 
              onClick={cleanupDatabase}
              disabled={isLoading}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-100 hover:bg-red-200 text-red-800'
              }`}
            >
              {isLoading ? 'Processando...' : 'Limpar Dados Legados'}
            </button>
            
            {cleanupMessage && (
              <div className={`mt-2 p-2 rounded ${
                cleanupMessage.includes('Error') 
                  ? 'bg-red-50 text-red-800' 
                  : 'bg-green-50 text-green-800'
              }`}>
                {cleanupMessage}
              </div>
            )}
          </div>
        </details>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Dicas de Performance</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use o botão Refresh nas telas ao invés de recarregar a página</li>
          <li>• Os dados são cacheados por 30 segundos para melhor performance</li>
          <li>• Alterações são aplicadas instantaneamente sem reload</li>
          <li>• TypeScript e ESLint agora validam o código em build</li>
        </ul>
      </div>
    </div>
  )
} 