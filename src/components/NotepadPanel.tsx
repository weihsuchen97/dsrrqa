import { useRef, useEffect, ClipboardEvent } from 'react'
import { Separator } from '@/components/ui/separator'
import { hasStructuralFormatting, htmlToText } from '@/lib/htmlToText'

interface NotepadPanelProps {
  content: string
  onContentChange: (value: string) => void
}

export function NotepadPanel({ content, onContentChange }: NotepadPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 從外部更新 content 時（例如清空後），同步到 textarea value
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== content) {
      textareaRef.current.value = content
    }
  }, [content])

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const cd = e.clipboardData
    const html = cd.getData('text/html')
    const plain = cd.getData('text/plain')

    let insertText = plain
    if (html && hasStructuralFormatting(html)) {
      const converted = htmlToText(html)
      if (converted.trim()) insertText = converted
    }

    e.preventDefault()
    const ta = e.currentTarget
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = ta.value.slice(0, start)
    const after = ta.value.slice(end)
    const next = before + insertText + after
    ta.value = next
    const caret = start + insertText.length
    ta.setSelectionRange(caret, caret)
    onContentChange(next)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onContentChange(e.target.value)
  }

  function handleClear() {
    if (textareaRef.current) textareaRef.current.value = ''
    onContentChange('')
  }

  async function handleCopy() {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      // 忽略
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between py-2 shrink-0">
        <span className="text-[11px] font-semibold tracking-widest text-white/55 uppercase leading-5">記事本</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="複製全部"
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            onClick={handleClear}
            title="清空"
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <Separator className="bg-white/8 my-1.5 shrink-0" />

      <div className="flex-1 min-h-0 pb-2">
        <textarea
          ref={textareaRef}
          defaultValue={content}
          onChange={handleChange}
          onPaste={handlePaste}
          spellCheck={false}
          placeholder="貼上文字會自動去除字型/顏色格式，只保留列表、粗體等結構…"
          className="w-full h-full resize-none bg-white/5 rounded-none px-6 py-3.5
            text-[13px] leading-6 text-white/85 placeholder:text-white/30
            outline-none focus:bg-white/8 transition-colors
            font-mono"
          style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
        />
      </div>
    </div>
  )
}
