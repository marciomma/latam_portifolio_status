"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [cleanupMessage, setCleanupMessage] = useState("")

  const cleanupDatabase = async () => {
    try {
      const confirmed = window.confirm("This will remove legacy mockup data from the database. Continue?")
      if (!confirmed) return

      setCleanupMessage("Cleaning database...")
      
      const response = await fetch('/api/clean-portfolio-data', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCleanupMessage(result.message)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setCleanupMessage(`Error: ${result.message}`)
      }
    } catch (error) {
      setCleanupMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
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
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
            >
              Limpar Dados Legados
            </button>
            
            {cleanupMessage && (
              <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded">
                {cleanupMessage}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  )
} 