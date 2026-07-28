import { useCallback, useState } from 'react'
import { fetchMapTraces, fetchMapTrace } from '../api/mapTracesApi'
import { LocalDataApiError } from '../types/localData'
import type { MapTrace, MapTraceDetail } from '../types/mapTracesApi'

interface MapTracesState {
  traces: MapTrace[]
  currentTrace: MapTraceDetail | null
  loading: boolean
  error: string | null
}

function toErrorMessage(err: unknown): string {
  if (err instanceof LocalDataApiError) {
    if (err.status === 401) return 'Session expirée. Veuillez vous reconnecter.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Erreur inconnue'
}

export function useMapTraces() {
  const [state, setState] = useState<MapTracesState>({
    traces: [],
    currentTrace: null,
    loading: false,
    error: null,
  })

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const traces = await fetchMapTraces()
      setState((s) => ({ ...s, traces, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const fetchOne = useCallback(async (traceId: number) => {
    setState((s) => ({ ...s, loading: true, error: null, currentTrace: null }))
    try {
      const trace = await fetchMapTrace(traceId)
      setState((s) => ({ ...s, currentTrace: trace, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const clearCurrent = useCallback(() => {
    setState((s) => ({ ...s, currentTrace: null }))
  }, [])

  return { ...state, fetchAll, fetchOne, clearCurrent }
}
