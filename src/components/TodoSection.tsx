import { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import type { TodoItem } from '@/types/todo'
import { cn } from '@/lib/utils'

type Priority = TodoItem['priority']

const PRIORITY_LABELS: Record<Priority, string> = {
  high:   '高',
  medium: '中',
  low:    '低',
}

const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
  high:   'badge-high',
  medium: 'badge-medium',
  low:    'badge-low',
}

interface TodoRowProps {
  item: TodoItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function TodoRow({ item, onToggle, onDelete }: TodoRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="shrink-0 border-white/30 data-[state=checked]:bg-white/70"
      />

      <span
        className={cn(
          'flex-1 text-sm leading-snug truncate transition-all',
          item.completed ? 'line-through text-white/30' : 'text-white/85'
        )}
      >
        {item.title}
      </span>

      {/* External badge */}
      {item.externalKey && (
        <span className="text-[10px] text-white/30 shrink-0 font-mono">
          {item.externalKey}
        </span>
      )}

      {/* 修正 B：固定寬度讓高/中/低三個標籤等寬對齊 */}
      <Badge className={cn('text-[10px] px-0 py-0 shrink-0 border-0 w-8 justify-center text-center', PRIORITY_BADGE_CLASS[item.priority])}>
        {PRIORITY_LABELS[item.priority]}
      </Badge>

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
    </motion.div>
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
              'flex-1 text-xs py-0.5 rounded-md border transition-all font-medium',
              priority === p
                ? p === 'high'
                  ? 'bg-red-500/25 border-red-500/60 text-red-300'
                  : p === 'medium'
                  ? 'bg-yellow-500/25 border-yellow-500/60 text-yellow-300'
                  : 'bg-green-500/25 border-green-500/60 text-green-300'
                : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
            )}
          >
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
}

export function TodoSection({ todos, onToggle, onDelete, onAdd }: TodoSectionProps) {
  const [showForm, setShowForm] = useState(false)

  function handleAdd(title: string, priority: Priority) {
    onAdd(title, priority)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-1.5 shrink-0">
        <span className="text-xs font-semibold text-white/60 tracking-wide">待辦事項</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowForm((v) => !v)}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center transition-all text-sm font-light',
                showForm
                  ? 'bg-white/15 text-white rotate-45'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/10'
              )}
            >
              +
            </button>
          </TooltipTrigger>
          <TooltipContent side="left"><p>新增待辦事項</p></TooltipContent>
        </Tooltip>
      </div>

      <Separator className="bg-white/8 mb-1 shrink-0" />

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0"
          >
            <AddForm onAdd={handleAdd} />
            <Separator className="bg-white/8 mb-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pr-2 pb-2">
          {todos.length === 0 ? (
            <div className="text-center text-xs text-white/25 py-6">
              點 + 新增第一筆待辦事項
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {todos.map((item) => (
                <TodoRow
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
