import { useState, useCallback } from 'react'
import {
  fetchRoads,
  createRoad,
  updateRoad,
  validateRoad,
  rejectRoad,
  fetchRoadsTaxonomy,
  type RoadUpdate,
} from '../api/roadsApi'
import {
  fetchRoadsMock,
  validateRoadMock,
  rejectRoadMock,
} from '../api/roadsApi.mock'
import type { RoadCreate, RoadRead, LayerVisibility } from '../types/localData'

interface UseRoadsReturn {
  roads: RoadRead[]
  loading: boolean
  error: string | null
  taxonomy: Record<string, string[]> | null
  fetchAll: (status?: 'proposed' | 'validated' | 'rejected') => Promise<void>
  create: (road: RoadCreate) => Promise<RoadRead>
  update: (id: number, patch: RoadUpdate) => Promise<RoadRead>
  validate: (id: number) => Promise<void>
  reject: (id: number) => Promise<void>
  fetchTaxonomy: () => Promise<void>
}

export function useRoads(): UseRoadsReturn {
  const [roads, setRoads] = useState<RoadRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taxonomy, setTaxonomy] = useState<Record<string, string[]> | null>(null)

 const fetchAll = useCallback(async (status?: 'proposed' | 'validated' | 'rejected') => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await fetchRoads({ status, limit: 100 })
      } catch (err) {
        console.warn('[useRoads] Backend unavailable, using mock data')
        response = await fetchRoadsMock({ status, limit: 100 })
      }
     // Le backend ignore le filtre `status` en paramètre de requête et
      // renvoie systématiquement toutes les routes (tous statuts confondus).
      // On filtre donc ici, côté frontend, pour respecter le PRD :
      // une donnée non validée ne doit pas apparaître comme si elle l'était.
      const filtered = status ? response.filter((r) => r.validation_status === status) : response

      setRoads(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des routes')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (road: RoadCreate): Promise<RoadRead> => {
    setLoading(true)
    setError(null)
    try {
      const newRoad = await createRoad(road)
      setRoads((prev) => [...prev, newRoad])
      return newRoad
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: number, patch: RoadUpdate): Promise<RoadRead> => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateRoad(id, patch)
      // Le backend remet la donnée en 'proposed' après modif — on reflète
      // immédiatement ce nouvel état localement plutôt que d'attendre un refetch.
      setRoads((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la modification'
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
      let updated: RoadRead
      try {
        updated = await validateRoad(id)
      } catch (err) {
        console.warn('[useRoads] Backend unavailable, using mock data')
        updated = await validateRoadMock(id)
      }
      setRoads((prev) => prev.map((r) => (r.id === id ? updated : r)))
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
      let updated: RoadRead
      try {
        updated = await rejectRoad(id)
      } catch (err) {
        console.warn('[useRoads] Backend unavailable, using mock data')
        updated = await rejectRoadMock(id)
      }
      setRoads((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTaxonomy = useCallback(async () => {
    try {
      const data = await fetchRoadsTaxonomy()
      setTaxonomy(data)
    } catch (err) {
      console.error('Erreur lors du chargement de la taxonomie:', err)
    }
  }, [])

  return {
    roads,
    loading,
    error,
    taxonomy,
    fetchAll,
    create,
    update,
    validate,
    reject,
    fetchTaxonomy,
  }
}

// Hook for layer visibility state
export function useLayerVisibility() {
  const [visibility, setVisibility] = useState<LayerVisibility>({
    road_condition: true,
    flood_risk: false,
    blocked_roads: true,
    control_points: true,
    tolls: true,
    congestion: false,
    local_places: true,
  })

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }, [])

  const setLayer = useCallback((layer: keyof LayerVisibility, visible: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [layer]: visible,
    }))
  }, [])

  return { visibility, toggleLayer, setLayer }
}