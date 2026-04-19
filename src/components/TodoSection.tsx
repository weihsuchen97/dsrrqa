import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { Flag } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import type { TodoItem } from '@/types/todo'
import { cn } from '@/lib/utils'

type Priority = TodoItem['priority']

const ARCHIVE_AFTER_MS = 3_000

function isArchived(t: TodoItem, now: number): boolean {
  if (!t.completed) return false
  if (!t.completedAt) return true
  return now - Date.parse(t.completedAt) >= ARCHIVE_AFTER_MS
}

const PRIORITY_TOOLTIP: Record<Priority, string> = {
  high:   '高優先',
  medium: '中優先',
  low:    '低優先',
}

/** 點擊優先度圖示時的循環:高→中→低→高 */
const PRIORITY_CYCLE: Record<Priority, Priority> = {
  high:   'medium',
  medium: 'low',
  low:    'high',
}

/** Flag priority indicator — filled flags convey urgency (Todoist / Gmail style).
    顏色由 App.css 的 .priority-flag-* class 依主題切換（深色鮮豔 / 淺色深飽和）。 */
function PriorityFlag({ priority }: { priority: Priority }) {
  const isLow = priority === 'low'
  return (
    <Flag
      size={13}
      strokeWidth={2}
      fill={isLow ? 'none' : 'currentColor'}
      className={cn('shrink-0', `priority-flag-${priority}`)}
    />
  )
}

interface TodoRowProps {
  item: TodoItem
  isEditing: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onStartEdit: (id: string) => void
  onFinishEdit: (id: string, newTitle: string) => void
  onCancelEdit: (id: string) => void
  onEnterInEdit: (id: string, currentTitle: string) => void
  onSetPriority: (id: string, priority: Priority) => void
}

function TodoRow({ item, isEditing, onToggle, onDelete, onStartEdit, onFinishEdit, onCancelEdit, onEnterInEdit, onSetPriority }: TodoRowProps) {
  const [hovered, setHovered] = useState(false)
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 group transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ listStyle: 'none' }}
    >
      {/* Drag handle */}
      <div
        className="shrink-0 cursor-grab active:cursor-grabbing text-white/15 hover:text-white/40 transition-colors touch-none select-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
          <circle cx="2" cy="2" r="1.2" />
          <circle cx="6" cy="2" r="1.2" />
          <circle cx="2" cy="7" r="1.2" />
          <circle cx="6" cy="7" r="1.2" />
          <circle cx="2" cy="12" r="1.2" />
          <circle cx="6" cy="12" r="1.2" />
        </svg>
      </div>

      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="shrink-0 border-white/30 data-[state=checked]:bg-white/70"
      />

      {isEditing ? (
        <input
          autoFocus
          defaultValue={item.title}
          className="flex-1 text-[13px] bg-white/10 border border-white/20 rounded px-1 py-0.5 outline-none text-white min-w-0"
          onBlur={(e) => onFinishEdit(item.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnterInEdit(item.id, e.currentTarget.value)
            }
            if (e.key === 'Escape') {
              onCancelEdit(item.id)
            }
          }}
        />
      ) : (
        <span
          onClick={() => !item.completed && onStartEdit(item.id)}
          className={cn(
            'flex-1 text-[13px] leading-6 truncate transition-all',
            item.completed ? 'line-through text-white/30' : 'text-white/85 cursor-text'
          )}
        >
          {item.title || '\u00A0'}
        </span>
      )}

      {/* External badge */}
      {item.externalKey && (
        <span className="text-[11px] text-white/35 shrink-0 font-mono tabular-nums">
          {item.externalKey}
        </span>
      )}

      <button
        type="button"
        title={`${PRIORITY_TOOLTIP[item.priority]}（點擊切換）`}
        onClick={() => onSetPriority(item.id, PRIORITY_CYCLE[item.priority])}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 hover:bg-white/10 transition-colors"
      >
        <PriorityFlag priority={item.priority} />
      </button>

      <AnimatePresence>
        {hovered && !isEditing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            onClick={() => onDelete(item.id)}
            className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </Reorder.Item>
  )
}

interface InlineAddRowProps {
  onAdd: (title: string, priority: Priority) => void
}

/** 永駐於列表底部的輸入行:Enter 送出並保持 focus,允許連續輸入 */
function InlineAddRow({ onAdd }: InlineAddRowProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const t = title.trim()
    if (!t) return
    onAdd(t, priority)
    setTitle('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
      {/* drag handle 佔位,與 TodoRow 對齊 */}
      <div className="shrink-0 w-2" />
      <div className="shrink-0 w-4 h-4 flex items-center justify-center text-white/30">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M5 1.5v7M1.5 5h7" />
        </svg>
      </div>
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="新增待辦事項…"
        className="flex-1 text-[13px] leading-6 bg-transparent outline-none text-white placeholder:text-white/30 min-w-0"
      />
      <button
        type="button"
        title={`${PRIORITY_TOOLTIP[priority]}（點擊切換）`}
        onClick={() => setPriority((p) => PRIORITY_CYCLE[p])}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 hover:bg-white/10 transition-colors"
      >
        <PriorityFlag priority={priority} />
      </button>
    </div>
  )
}

interface TodoSectionProps {
  todos: TodoItem[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (title: string, priority: Priority) => void
  onEdit: (id: string, newTitle: string) => void
  onSetPriority: (id: string, priority: Priority) => void
  onEditAndInsertAfter: (id: string, newTitle: string, priority: Priority) => string
  onReorder: (reordered: TodoItem[]) => void
}

export function TodoSection({ todos, onToggle, onDelete, onAdd, onEdit, onSetPriority, onEditAndInsertAfter, onReorder }: TodoSectionProps) {
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const skipNextFinishRef = useRef(false)

  function handleAdd(title: string, priority: Priority) {
    onAdd(title, priority)
  }

  function handleStartEdit(id: string) {
    setEditingId(id)
  }

  function handleFinishEdit(id: string, newTitle: string) {
    if (skipNextFinishRef.current) {
      skipNextFinishRef.current = false
      return
    }
    const trimmed = newTitle.trim()
    if (trimmed) {
      onEdit(id, trimmed)
    } else {
      onDelete(id)
    }
    setEditingId(null)
  }

  function handleCancelEdit(id: string) {
    skipNextFinishRef.current = true
    const item = todos.find((t) => t.id === id)
    if (item && !item.title.trim()) {
      onDelete(id)
    }
    setEditingId(null)
  }

  function handleEnterInEdit(id: string, currentTitle: string) {
    skipNextFinishRef.current = true
    const currentItem = todos.find((t) => t.id === id)
    const priority = currentItem?.priority ?? 'medium'
    const newId = onEditAndInsertAfter(id, currentTitle, priority)
    setEditingId(newId)
  }

  // 每秒 tick，讓「完成後 3 秒自動收起」的門檻能觸發 re-render
  const [now, setNow] = useState(() => Date.now())
  const hasPendingArchive = todos.some(
    (t) => t.completed && t.completedAt && Date.now() - Date.parse(t.completedAt) < ARCHIVE_AFTER_MS
  )
  useEffect(() => {
    if (!hasPendingArchive) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [hasPendingArchive])

  const [archivedOpen, setArchivedOpen] = useState(false)

  const filtered = filterPriority ? todos.filter((t) => t.priority === filterPriority) : todos
  const active = filtered.filter((t) => !isArchived(t, now))
  const archived = filtered.filter((t) => isArchived(t, now))

  // Reorder 只作用於 active。archived 與被篩掉的項目保持原位。
  const handleReorder = useCallback((newActive: TodoItem[]) => {
    const newActiveIds = new Set(newActive.map((t) => t.id))
    const activePositions: number[] = []
    todos.forEach((t, i) => {
      if (newActiveIds.has(t.id)) activePositions.push(i)
    })
    const result = [...todos]
    activePositions.forEach((pos, i) => {
      result[pos] = newActive[i]
    })
    onReorder(result)
  }, [todos, onReorder])

  return (
    <div className="flex flex-col flex-1 min-h-0 px-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 shrink-0">
        <span className="text-[11px] font-semibold text-white/55 tracking-widest uppercase leading-5">待辦事項</span>
        <div className="flex items-center gap-0.5">
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              title={PRIORITY_TOOLTIP[p]}
              onClick={() => setFilterPriority((v) => v === p ? null : p)}
              className={cn(
                'inline-flex items-center justify-center w-7 h-7 rounded-md transition-all',
                filterPriority === p
                  ? 'bg-white/10 ring-1 ring-white/20 opacity-100'
                  : 'opacity-35 hover:opacity-70 hover:bg-white/5'
              )}
            >
              <PriorityFlag priority={p} />
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-white/8 my-1.5 shrink-0" />

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pr-2 pb-1">
          {active.length > 0 && (
            <Reorder.Group axis="y" values={active} onReorder={handleReorder} as="div">
              {active.map((item) => (
                <TodoRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onStartEdit={handleStartEdit}
                  onFinishEdit={handleFinishEdit}
                  onCancelEdit={handleCancelEdit}
                  onEnterInEdit={handleEnterInEdit}
                  onSetPriority={onSetPriority}
                />
              ))}
            </Reorder.Group>
          )}

          {/* 輸入行:緊接在最後一個 active 待辦下方 */}
          <InlineAddRow onAdd={handleAdd} />

          {filterPriority && filtered.length === 0 && (
            <div className="text-center text-[12px] text-white/30 py-6">此優先度沒有待辦事項</div>
          )}

          {archived.length > 0 && (
            <ArchivedSection
              items={archived}
              open={archivedOpen}
              onToggleOpen={() => setArchivedOpen((v) => !v)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface ArchivedSectionProps {
  items: TodoItem[]
  open: boolean
  onToggleOpen: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function ArchivedSection({ items, open, onToggleOpen, onToggle, onDelete }: ArchivedSectionProps) {
  return (
    <div className="mt-3 border-t border-white/5 pt-1.5">
      <button
        onClick={onToggleOpen}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-white/45 hover:text-white/80 hover:bg-white/5 rounded-md transition-colors leading-5"
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10"
          className={cn('transition-transform', open && 'rotate-90')}
          fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="3 2 7 5 3 8" />
        </svg>
        <span className="font-semibold tracking-wider uppercase">已完成</span>
        <span className="text-white/30 tabular-nums">({items.length})</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="archived-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-0.5">
              {items.map((item) => (
                <ArchivedRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ArchivedRow({ item, onToggle, onDelete }: { item: TodoItem; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="shrink-0 w-2" />
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="shrink-0 border-white/30 data-[state=checked]:bg-white/70"
      />
      <span className="flex-1 text-[13px] leading-6 truncate line-through text-white/30">
        {item.title || '\u00A0'}
      </span>
      {item.externalKey && (
        <span className="text-[11px] text-white/30 shrink-0 font-mono tabular-nums">
          {item.externalKey}
        </span>
      )}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            onClick={() => onDelete(item.id)}
            className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
