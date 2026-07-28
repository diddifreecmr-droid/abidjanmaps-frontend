import { useRef, useState, type ReactNode } from 'react'

interface BottomSheetProps {
  children: ReactNode
}

const PEEK_HEIGHT_VH = 42
const EXPANDED_HEIGHT_VH = 85

export function BottomSheet({ children }: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const draggingRef = useRef(false)
  const draggedEnoughRef = useRef(false)
  const startYRef = useRef(0)

  const baseHeightVh = expanded ? EXPANDED_HEIGHT_VH : PEEK_HEIGHT_VH

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    draggedEnoughRef.current = false
    startYRef.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const deltaY = e.clientY - startYRef.current
    if (Math.abs(deltaY) > 5) draggedEnoughRef.current = true
    // deltaY positif = doigt vers le bas = on réduit la hauteur
    setDragOffset(-deltaY)
  }

  const handlePointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false

    const thresholdPx = window.innerHeight * 0.12
    if (dragOffset < -thresholdPx) {
      setExpanded(false)
    } else if (dragOffset > thresholdPx) {
      setExpanded(true)
    }
    setDragOffset(0)
  }

  const handleHandleClick = () => {
    if (!draggedEnoughRef.current) {
      setExpanded((v) => !v)
    }
  }

  const heightStyle = `calc(${baseHeightVh}vh + ${dragOffset}px)`

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white rounded-t-2xl shadow-lg flex flex-col"
      style={{
        height: heightStyle,
        maxHeight: '90vh',
        minHeight: '20vh',
        transition: draggingRef.current ? 'none' : 'height 200ms ease-out',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleHandleClick}
        className="w-full flex justify-center py-2.5 shrink-0 touch-none cursor-grab active:cursor-grabbing"
      >
        <span className="w-10 h-1.5 rounded-full bg-gray-300" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">{children}</div>
    </div>
  )
}