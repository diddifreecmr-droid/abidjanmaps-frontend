import { useState, useCallback } from 'react'
import {
  fetchPlaces,
  createPlace,
  validatePlace,
  rejectPlace,
} from '../api/placesApi'
import {
  fetchPlacesMock,
  validatePlaceMock,
  rejectPlaceMock,
} from '../api/placesApi.mock'
import type { PlaceCreate, PlaceRead } from '../types/localData'

interface UsePlacesReturn {
  places: PlaceRead[]
  loading: boolean
  error: string | null
  fetchAll: (status?: 'proposed' | 'validated' | 'rejected') => Promise<void>
  create: (place: PlaceCreate) => Promise<PlaceRead>
  validate: (id: number) => Promise<void>
  reject: (id: number) => Promise<void>
}

export function usePlaces(): UsePlacesReturn {
  const [places, setPlaces] = useState<PlaceRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (status?: 'proposed' | 'validated' | 'rejected') => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await fetchPlaces({ status, limit: 100 })
      } catch (err) {
        console.warn('[usePlaces] Backend unavailable, using mock data')
        response = await fetchPlacesMock({ status, limit: 100 })
      }
      // Même remarque que pour useRoads : le backend ignore `status`
      // et renvoie tout, donc on filtre ici pour rester conforme au PRD.
      const filtered = status ? response.filter((p) => p.validation_status === status) : response

      setPlaces(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des lieux')
    } finally {
      setLoading(false)
    }
  }, [])
  const create = useCallback(async (place: PlaceCreate): Promise<PlaceRead> => {
    setLoading(true)
    setError(null)
    try {
      const newPlace = await createPlace(place)
      setPlaces((prev) => [...prev, newPlace])
      return newPlace
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const validate = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      let updated: PlaceRead
      try {
        updated = await validatePlace(id)
      } catch (err) {
        console.warn('[usePlaces] Backend unavailable, using mock data')
        updated = await validatePlaceMock(id)
      }
      setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }, [])

  const reject = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      let updated: PlaceRead
      try {
        updated = await rejectPlace(id)
      } catch (err) {
        console.warn('[usePlaces] Backend unavailable, using mock data')
        updated = await rejectPlaceMock(id)
      }
      setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    places,
    loading,
    error,
    fetchAll,
    create,
    validate,
    reject,
  }
}