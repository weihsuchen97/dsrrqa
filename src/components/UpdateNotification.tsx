import { useUpdater } from '@/hooks/useUpdater'
import { Download, RefreshCw, CheckCircle } from 'lucide-react'

export function UpdateNotification() {
  const { status, version, progress, downloadAndInstall, installAndRelaunch } = useUpdater()

  if (status !== 'available' && status !== 'downloading' && status !== 'ready') return null

  return (
    <div className="mx-2.5 mb-4 px-6 py-2.5 text-xs leading-5 bg-white/5">
      {status === 'available' && (
        <div className="flex items-center gap-2 text-white/80">
          <span className="flex-1">新版本 {version} 可用</span>
          <button
            onClick={downloadAndInstall}
            aria-label="下載更新"
            className="p-1 bg-white/10 hover:bg-white/15 transition-colors"
          >
            <Download size={14} />
          </button>
        </div>
      )}

      {status === 'downloading' && (
        <div className="flex flex-col gap-1 text-white/80">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="shrink-0 animate-spin opacity-70" />
            <span className="flex-1">下載中… {progress}%</span>
          </div>
          <div className="h-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-white/40 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex items-center gap-2 text-white/80">
          <CheckCircle size={14} className="shrink-0 opacity-70" />
          <span className="flex-1">更新已就緒</span>
          <button
            onClick={installAndRelaunch}
            className="px-2 py-0.5 text-[11px] font-medium bg-white/10 hover:bg-white/15 transition-colors"
          >
            重啟
          </button>
        </div>
      )}
    </div>
  )
}
