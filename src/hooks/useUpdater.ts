import { useState, useEffect, useCallback } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error'

interface UpdateState {
  status: UpdateStatus
  version: string | null
  error: string | null
  progress: number
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    status: 'idle',
    version: null,
    error: null,
    progress: 0,
  })

  const checkForUpdate = useCallback(async () => {
    try {
      setState(s => ({ ...s, status: 'checking', error: null }))
      const update = await check()

      if (!update) {
        setState(s => ({ ...s, status: 'idle' }))
        return
      }

      setState(s => ({ ...s, status: 'available', version: update.version }))
    } catch (e) {
      setState(s => ({ ...s, status: 'error', error: String(e) }))
    }
  }, [])

  const downloadAndInstall = useCallback(async () => {
    try {
      const update = await check()
      if (!update) return

      setState(s => ({ ...s, status: 'downloading', progress: 0 }))

      let totalLen = 0
      let downloaded = 0

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            totalLen = event.data.contentLength ?? 0
            break
          case 'Progress':
            downloaded += event.data.chunkLength
            if (totalLen > 0) {
              setState(s => ({ ...s, progress: Math.round((downloaded / totalLen) * 100) }))
            }
            break
          case 'Finished':
            setState(s => ({ ...s, status: 'ready', progress: 100 }))
            break
        }
      })
    } catch (e) {
      setState(s => ({ ...s, status: 'error', error: String(e) }))
    }
  }, [])

  const installAndRelaunch = useCallback(async () => {
    await relaunch()
  }, [])

  // Auto-check on mount and every 30 minutes
  useEffect(() => {
    checkForUpdate()
    const interval = setInterval(checkForUpdate, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkForUpdate])

  return { ...state, checkForUpdate, downloadAndInstall, installAndRelaunch }
}
