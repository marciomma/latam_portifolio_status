// lib/kv.ts
// Implementação simples de um serviço de armazenamento Key-Value

// Armazenamento em memória para simular um banco de dados
const store = new Map<string, any>()

export const kv = {
  // Verifica se uma chave existe
  async exists(key: string): Promise<boolean> {
    return store.has(key)
  },

  // Obtém um valor pelo nome da chave
  async get<T>(key: string): Promise<T | null> {
    const value = store.get(key)
    return value ? (value as T) : null
  },

  // Define um valor para uma chave
  async set(key: string, value: any): Promise<void> {
    store.set(key, value)
  },

  // Remove uma chave
  async delete(key: string): Promise<void> {
    store.delete(key)
  },

  // Lista todas as chaves
  async keys(): Promise<string[]> {
    return Array.from(store.keys())
  },
}
