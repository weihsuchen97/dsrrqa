import { getCurrentWindow } from '@tauri-apps/api/window'

type ResizeDirection = 'East' | 'North' | 'NorthEast' | 'NorthWest' | 'South' | 'SouthEast' | 'SouthWest' | 'West'

type HandleConfig = {
  dir: ResizeDirection
  style: React.CSSProperties
}

const HANDLES: HandleConfig[] = [
  { dir: 'North',     style: { top: 0,    left: 12,  right: 12,  height: 6,  cursor: 'n-resize'  } },
  { dir: 'South',     style: { bottom: 0, left: 12,  right: 12,  height: 6,  cursor: 's-resize'  } },
  { dir: 'East',      style: { right: 0,  top: 12,   bottom: 12, width: 6,   cursor: 'e-resize'  } },
  { dir: 'West',      style: { left: 0,   top: 12,   bottom: 12, width: 6,   cursor: 'w-resize'  } },
  { dir: 'NorthEast', style: { top: 0,    right: 0,  width: 12,  height: 12, cursor: 'ne-resize' } },
  { dir: 'NorthWest', style: { top: 0,    left: 0,   width: 12,  height: 12, cursor: 'nw-resize' } },
  { dir: 'SouthEast', style: { bottom: 0, right: 0,  width: 12,  height: 12, cursor: 'se-resize' } },
  { dir: 'SouthWest', style: { bottom: 0, left: 0,   width: 12,  height: 12, cursor: 'sw-resize' } },
]

export function ResizeHandles() {
  async function handleMouseDown(e: React.MouseEvent, dir: ResizeDirection) {
    if (e.button !== 0) return
    e.preventDefault()
    await getCurrentWindow().startResizeDragging(dir)
  }

  return (
    <>
      {HANDLES.map(({ dir, style }) => (
        <div
          key={dir}
          style={{
            position: 'fixed',
            zIndex: 9999,
            ...style,
          }}
          onMouseDown={(e) => handleMouseDown(e, dir)}
        />
      ))}
    </>
  )
}
