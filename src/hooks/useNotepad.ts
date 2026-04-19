import { useState, useEffect, useCallback, useRef } from 'react'
import { load, type Store } from '@tauri-apps/plugin-store'

const STORE_FILE = 'notepad.json'
const KEY_CONTENT = 'content'

export function useNotepad() {
  const [content, setContent] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const storeRef = useRef<Store | null>(null)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const store = await load(STORE_FILE, {
          autoSave: false,
          defaults: { [KEY_CONTENT]: '' },
        })
        storeRef.current = store
        const savedContent = await store.get<string>(KEY_CONTENT)
        if (typeof savedContent === 'string') setContent(savedContent)
      } catch {
        // Fresh start
      }
      setLoaded(true)
    }
    init()
  }, [])

  const saveContent = useCallback((value: string) => {
    setContent(value)
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      const store = storeRef.current
      if (!store) return
      await store.set(KEY_CONTENT, value)
      await store.save()
    }, 300)
  }, [])

  return { content, setContent: saveContent, loaded }
}
