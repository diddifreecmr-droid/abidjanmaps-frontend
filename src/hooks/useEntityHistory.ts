import { useCallback, useState } from 'react'
import { fetchRoadHistory } from '../api/roadsApi'
import { fetchPlaceHistory } from '../api/placesApi'
import type { RoadHistoryEntry, PlaceHistoryEntry } from '../types/localData'

export type HistoryEntry = RoadHistoryEntry | PlaceHistoryEntry
export type HistoryEntityType = 'road' | 'place'

interface EntityHistoryState {
  entries: HistoryEntry[]
  loading: boolean
  error: string | null
}

const EMPTY_STATE: EntityHistoryState = { entries: [], loading: false, error: null }

export function useEntityHistory() {
  // Une entrée par item ouvert, indexée par "type:id" pour supporter
  // plusieurs panneaux d'historique ouverts en même temps.
  const [statesByKey, setStatesByKey] = useState<Record<string, EntityHistoryState>>({})

  const load = useCallback(async (type: HistoryEntityType, id: number) => {
    const key = `${type}:${id}`
    setStatesByKey((prev) => ({
      ...prev,
      [key]: { entries: prev[key]?.entries ?? [], loading: true, error: null },
    }))

    try {
      const entries = type === 'road' ? await fetchRoadHistory(id) : await fetchPlaceHistory(id)
      setStatesByKey((prev) => ({ ...prev, [key]: { entries, loading: false, error: null } }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement de l'historique"
      setStatesByKey((prev) => ({ ...prev, [key]: { entries: [], loading: false, error: message } }))
    }
  }, [])

  const getState = useCallback(
    (type: HistoryEntityType, id: number): EntityHistoryState => {
      return statesByKey[`${type}:${id}`] ?? EMPTY_STATE
    },
    [statesByKey]
  )

  return { load, getState }
}