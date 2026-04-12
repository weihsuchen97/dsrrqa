import { useState, useRef, KeyboardEvent, useCallback } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { TodoItem } from '@/types/todo'
import { cn } from '@/lib/utils'

type Priority = TodoItem['priority']

const PRIORITY_LABELS: Record<Priority, string> = {
  high:   '高',
  medium: '中',
  low:    '低',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high:   '#f87171',
  medium: '#fbbf24',
  low:    '#4ade80',
}

const PRIORITY_TOOLTIP: Record<Priority, string> = {
  high:   '高優先',
  medium: '中優先',
  low:    '低優先',
}

/** Signal-bars priority indicator — lit bars convey urgency */
function PriorityBars({ priority }: { priority: Priority }) {
  const isHigh = priority === 'high'
  const isMedOrHigh = priority === 'medium' || isHigh
  const color = PRIORITY_COLORS[priority]
  const dim = 'rgba(255,255,255,0.08)'

  return (
    <svg
      width="14" height="12" viewBox="0 0 14 12"
      className="shrink-0"
      style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}
    >
      <rect x="0.5" y="7.5" width="3.2" height="4" rx="0.8" fill={color} />
      <rect x="5.4" y="4" width="3.2" height="7.5" rx="0.8" fill={isMedOrHigh ? color : dim} />
      <rect x="10.3" y="0.5" width="3.2" height="11" rx="0.8" fill={isHigh ? color : dim} />
    </svg>
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
}

function TodoRow({ item, isEditing, onToggle, onDelete, onStartEdit, onFinishEdit, onCancelEdit, onEnterInEdit }: TodoRowProps) {
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
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
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
          className="flex-1 text-sm bg-white/10 border border-white/20 rounded px-1 py-0.5 outline-none text-white min-w-0"
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
            'flex-1 text-sm leading-snug truncate transition-all',
            item.completed ? 'line-through text-white/30' : 'text-white/85 cursor-text'
          )}
        >
          {item.title || '\u00A0'}
        </span>
      )}

      {/* External badge */}
      {item.externalKey && (
        <span className="text-[10px] text-white/30 shrink-0 font-mono">
          {item.externalKey}
        </span>
      )}

      <span
        title={PRIORITY_TOOLTIP[item.priority]}
        className="inline-flex items-center justify-center w-6 h-5 rounded shrink-0 cursor-default hover:bg-white/5 transition-colors"
      >
        <PriorityBars priority={item.priority} />
      </span>

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

interface AddFormProps {
  onAdd: (title: string, priority: Priority) => void
}

function AddForm({ onAdd }: AddFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  function submit() {
    const t = title.trim()
    if (!t) return
    onAdd(t, priority)
    setTitle('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex flex-col gap-1.5 px-2 pt-1 pb-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="新增待辦事項…"
        className="h-8 text-sm bg-white/8 border-white/12 text-white placeholder:text-white/30 focus-visible:ring-white/20"
      />
      <div className="flex items-center gap-1.5">
        {(['high', 'medium', 'low'] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs py-1 rounded-md border transition-all font-medium',
              priority === p
                ? p === 'high'
                  ? 'bg-red-500/15 border-red-400/30 text-red-300'
                  : p === 'medium'
                  ? 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300'
                  : 'bg-green-500/15 border-green-400/30 text-green-300'
                : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
            )}
          >
            <PriorityBars priority={p} />
            {PRIORITY_LABELS[p]}
          </button>
        ))}
        <Button
          size="sm"
          onClick={submit}
          disabled={!title.trim()}
          className="h-6 px-2 text-xs bg-white/15 hover:bg-white/25 text-white border-0"
        >
          新增
        </Button>
      </div>
    </div>
  )
}

interface TodoSectionProps {
  todos: TodoItem[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (title: string, priority: Priority) => void
  onEdit: (id: string, newTitle: string) => void
  onEditAndInsertAfter: (id: string, newTitle: string, priority: Priority) => string
  onReorder: (reordered: TodoItem[]) => void
}

export function TodoSection({ todos, onToggle, onDelete, onAdd, onEdit, onEditAndInsertAfter, onReorder }: TodoSectionProps) {
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

  const filtered = filterPriority ? todos.filter((t) => t.priority === filterPriority) : todos

  const handleReorder = useCallback((newFiltered: TodoItem[]) => {
    if (!filterPriority) {
      onReorder(newFiltered)
    } else {
      // 有篩選時：保持未篩選項目的位置，只重排篩選到的項目
      const filteredPositions: number[] = []
      todos.forEach((t, i) => {
        if (t.priority === filterPriority) filteredPositions.push(i)
      })
      const result = [...todos]
      filteredPositions.forEach((pos, i) => {
        result[pos] = newFiltered[i]
      })
      onReorder(result)
    }
  }, [todos, filterPriority, onReorder])

  return (
    <div className="flex flex-col flex-1 min-h-0 px-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-1.5 shrink-0">
        <span className="text-xs font-semibold text-white/60 tracking-wide">待辦事項</span>
        <div className="flex items-center gap-1">
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              title={PRIORITY_TOOLTIP[p]}
              onClick={() => setFilterPriority((v) => v === p ? null : p)}
              className={cn(
                'p-1 rounded-md transition-all',
                filterPriority === p
                  ? 'bg-white/10 ring-1 ring-white/20 opacity-100'
                  : 'opacity-35 hover:opacity-70 hover:bg-white/5'
              )}
            >
              <PriorityBars priority={p} />
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-white/8 mb-1 shrink-0" />

      {/* Add form */}
      <div className="shrink-0">
        <AddForm onAdd={handleAdd} />
        <Separator className="bg-white/8 mb-1" />
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pr-2 pb-2">
          {filtered.length === 0 ? (
            <div className="text-center text-xs text-white/25 py-6">
              {filterPriority ? '此優先度沒有待辦事項' : '輸入文字後按 Enter 新增待辦事項'}
            </div>
          ) : (
            <Reorder.Group axis="y" values={filtered} onReorder={handleReorder} as="div">
              {filtered.map((item) => (
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
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
