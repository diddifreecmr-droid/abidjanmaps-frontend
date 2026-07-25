import { useCallback, useRef, useState } from 'react'

export interface RoutePoint {
  lat: number
  lng: number
}

export function useRoutePoints() {
  const [pointA, setPointAState] = useState<RoutePoint | null>(null)
  const [pointB, setPointBState] = useState<RoutePoint | null>(null)

  // Refs miroir pour lire la valeur à jour de façon synchrone dans handleMapClick,
  // sans dépendre du cycle de rendu de React (évite les problèmes de "stale closure")
  const pointARef = useRef<RoutePoint | null>(null)
  const pointBRef = useRef<RoutePoint | null>(null)

  const setPointA = useCallback((point: RoutePoint | null) => {
    pointARef.current = point
    setPointAState(point)
  }, [])

  const setPointB = useCallback((point: RoutePoint | null) => {
    pointBRef.current = point
    setPointBState(point)
  }, [])

  // Premier clic → pose le point A. Deuxième clic → pose le point B.
  // Une fois les deux posés, un clic sur la carte ne fait plus rien —
  // le repositionnement se fait par glisser-déposer des marqueurs (voir MapView),
  // et un nouveau trajet complet passe par le bouton Recalculer (Étape 8).
  const handleMapClick = useCallback(
    (point: RoutePoint) => {
      if (!pointARef.current) {
        setPointA(point)
      } else if (!pointBRef.current) {
        setPointB(point)
      }
    },
    [setPointA, setPointB]
  )

  const reset = useCallback(() => {
    setPointA(null)
    setPointB(null)
  }, [setPointA, setPointB])

  return { pointA, pointB, setPointA, setPointB, handleMapClick, reset }
}