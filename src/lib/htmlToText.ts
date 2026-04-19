/**
 * 將剪貼簿 HTML 轉為「結構化純文字」：
 * - 保留列表、粗體、斜體、標題、引用、連結的結構（Markdown 風格）
 * - 捨棄字型、顏色、字級、背景等視覺樣式
 * 若偵測不到任何「有意義的結構」則回傳 null，由呼叫端回退到純文字。
 */

const STRUCTURAL_TAGS = new Set([
  'UL', 'OL', 'LI',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'STRONG', 'B',
  'EM', 'I',
  'BLOCKQUOTE',
  'CODE', 'PRE',
  'A',
])

export function hasStructuralFormatting(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  let node = walker.nextNode()
  while (node) {
    if (STRUCTURAL_TAGS.has((node as Element).tagName)) return true
    node = walker.nextNode()
  }
  return false
}

interface Ctx {
  listStack: Array<{ kind: 'ul' | 'ol'; index: number }>
}

function renderNode(node: Node, ctx: Ctx): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\s+/g, ' ')
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName
  const inner = () => Array.from(el.childNodes).map(c => renderNode(c, ctx)).join('')

  switch (tag) {
    case 'BR':
      return '\n'
    case 'P':
    case 'DIV':
      return inner().replace(/\s+$/, '') + '\n'
    case 'H1': return `# ${inner().trim()}\n`
    case 'H2': return `## ${inner().trim()}\n`
    case 'H3': return `### ${inner().trim()}\n`
    case 'H4': return `#### ${inner().trim()}\n`
    case 'H5': return `##### ${inner().trim()}\n`
    case 'H6': return `###### ${inner().trim()}\n`
    case 'STRONG':
    case 'B': {
      const t = inner().trim()
      return t ? `**${t}**` : ''
    }
    case 'EM':
    case 'I': {
      const t = inner().trim()
      return t ? `*${t}*` : ''
    }
    case 'CODE': {
      const t = inner().trim()
      return t ? `\`${t}\`` : ''
    }
    case 'PRE':
      return `\n\`\`\`\n${el.textContent ?? ''}\n\`\`\`\n`
    case 'BLOCKQUOTE':
      return inner().split('\n').filter(Boolean).map(l => `> ${l}`).join('\n') + '\n'
    case 'A': {
      const href = (el as HTMLAnchorElement).getAttribute('href') ?? ''
      const text = inner().trim()
      if (!text) return ''
      if (!href || href === text) return text
      return `[${text}](${href})`
    }
    case 'UL':
    case 'OL': {
      ctx.listStack.push({ kind: tag === 'UL' ? 'ul' : 'ol', index: 0 })
      const out = inner()
      ctx.listStack.pop()
      return out + (ctx.listStack.length === 0 ? '\n' : '')
    }
    case 'LI': {
      const top = ctx.listStack[ctx.listStack.length - 1]
      const depth = Math.max(0, ctx.listStack.length - 1)
      const indent = '  '.repeat(depth)
      let marker = '- '
      if (top?.kind === 'ol') {
        top.index += 1
        marker = `${top.index}. `
      }
      // 子列表會自帶換行；單行 LI 補上換行
      const body = inner().replace(/\n+$/, '')
      return `${indent}${marker}${body}\n`
    }
    default:
      return inner()
  }
}

export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  // 刪掉 Word/Google Docs 等等附帶的 <style>、<script>、註解等
  doc.querySelectorAll('style, script, meta, link').forEach(n => n.remove())
  const ctx: Ctx = { listStack: [] }
  const out = Array.from(doc.body.childNodes).map(n => renderNode(n, ctx)).join('')
  return out
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
}
