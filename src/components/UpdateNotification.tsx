import { useUpdater } from '@/hooks/useUpdater'
import { Download, RefreshCw, X, CheckCircle } from 'lucide-react'

export function UpdateNotification() {
  const { status, version, progress, error, downloadAndInstall, installAndRelaunch, checkForUpdate } = useUpdater()

  if (status === 'idle' || status === 'checking') return null

  return (
    <div className="mx-2 mb-1 rounded-lg px-3 py-2 text-xs backdrop-blur-md"
      style={{ background: 'rgba(var(--ink), 0.08)', border: '1px solid rgba(var(--ink), 0.12)' }}>

      {status === 'available' && (
        <div className="flex items-center gap-2">
          <Download size={14} className="shrink-0 opacity-70" />
          <span className="flex-1">新版本 {version} 可用</span>
          <button
            onClick={downloadAndInstall}
            className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(var(--ink), 0.12)' }}
          >
            更新
          </button>
        </div>
      )}

      {status === 'downloading' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="shrink-0 animate-spin opacity-70" />
            <span className="flex-1">下載中… {progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(var(--ink), 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'rgba(var(--ink), 0.4)' }}
            />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="shrink-0 opacity-70" />
          <span className="flex-1">更新已就緒</span>
          <button
            onClick={installAndRelaunch}
            className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(var(--ink), 0.12)' }}
          >
            重啟
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2">
          <X size={14} className="shrink-0 text-red-400" />
          <span className="flex-1 truncate opacity-70">{error}</span>
          <button
            onClick={checkForUpdate}
            className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(var(--ink), 0.12)' }}
          >
            重試
          </button>
        </div>
      )}
    </div>
  )
}
