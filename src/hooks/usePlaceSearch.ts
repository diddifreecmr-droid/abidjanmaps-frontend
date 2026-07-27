import { useCallback, useRef, useState } from 'react'
import { searchPlaces } from '../api/placesApi'
import { searchPlacesMock } from '../api/placesApi.mock'
import type { PlaceRead } from '../types/localData'

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2

export function usePlaceSearch() {
  const [results, setResults] = useState<PlaceRead[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current
      try {
        let places: PlaceRead[]
        try {
          places = await searchPlaces(trimmed)
        } catch (err) {
          console.warn('[usePlaceSearch] Backend unavailable, using mock data')
          places = await searchPlacesMock(trimmed)
        }
        // Ignore les réponses obsolètes (l'utilisateur a tapé plus vite que la réponse)
        if (currentRequestId === requestIdRef.current) {
          setResults(places)
        }
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setResults([])
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }, DEBOUNCE_MS)
  }, [])

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setResults([])
    setLoading(false)
  }, [])

  return { results, loading, search, clear }
}