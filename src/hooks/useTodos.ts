import { useState, useEffect, useCallback, useRef } from 'react'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { TodoItem } from '../types/todo'

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const storeRef = useRef<Store | null>(null)

  useEffect(() => {
    async function loadTodos() {
      try {
        const store = await load('todos.json', { autoSave: false, defaults: { todos: [] } })
        storeRef.current = store
        const saved = await store.get<TodoItem[]>('todos')
        if (saved) setTodos(saved)
      } catch {
        // Fresh start if store doesn't exist yet
      }
      setLoaded(true)
    }
    loadTodos()
  }, [])

  const persist = useCallback(async (next: TodoItem[]) => {
    if (!storeRef.current) return
    await storeRef.current.set('todos', next)
    await storeRef.current.save()
  }, [])

  const addTodo = useCallback(
    async (title: string, priority: TodoItem['priority'] = 'medium') => {
      const item: TodoItem = {
        id: crypto.randomUUID(),
        title: title.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      const next = [item, ...todos]
      setTodos(next)
      await persist(next)
    },
    [todos, persist]
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      const next = todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
      setTodos(next)
      await persist(next)
    },
    [todos, persist]
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      const next = todos.filter((t) => t.id !== id)
      setTodos(next)
      await persist(next)
    },
    [todos, persist]
  )

  const total = todos.length
  const done = todos.filter((t) => t.completed).length
  const completionRate = total === 0 ? 0 : done / total

  return { todos, loaded, addTodo, toggleTodo, deleteTodo, completionRate, total, done }
}
