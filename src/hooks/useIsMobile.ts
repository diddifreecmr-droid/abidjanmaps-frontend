import { useEffect, useState } from 'react'

// 767px = juste sous le breakpoint `md` de Tailwind (768px), pour rester cohérent
// avec toutes les classes md: déjà utilisées ailleurs dans l'app.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)'

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    const handleChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}