import { useCallback, useState } from 'react'
import {
  fetchMapTraces,
  fetchMapTrace,
  analyzeMapTrace,
  fetchMapTraceAnalysis,
} from '../api/mapTracesApi'
import { LocalDataApiError } from '../types/localData'
import type { MapTrace, MapTraceDetail, MapTraceAnalysis } from '../types/mapTracesApi'

interface MapTracesState {
  traces: MapTrace[]
  currentTrace: MapTraceDetail | null
  currentAnalysis: MapTraceAnalysis | null
  loading: boolean
  analysisLoading: boolean
  error: string | null
  analysisError: string | null
}

function toErrorMessage(err: unknown): string {
  if (err instanceof LocalDataApiError) {
    if (err.status === 401) return 'Session expirée. Veuillez vous reconnecter.'
    if (err.status === 404) return 'Ressource introuvable.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Erreur inconnue'
}

export function useMapTraces() {
  const [state, setState] = useState<MapTracesState>({
    traces: [],
    currentTrace: null,
    currentAnalysis: null,
    loading: false,
    analysisLoading: false,
    error: null,
    analysisError: null,
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
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      currentTrace: null,
      currentAnalysis: null,
      analysisError: null,
    }))
    try {
      const trace = await fetchMapTrace(traceId)
      setState((s) => ({ ...s, currentTrace: trace, loading: false }))

      // Si la trace est déjà analysée, charger l'analyse automatiquement
      if (trace.status === 'analyzed') {
        setState((s) => ({ ...s, analysisLoading: true, analysisError: null }))
        try {
          const analysis = await fetchMapTraceAnalysis(traceId)
          setState((s) => ({ ...s, currentAnalysis: analysis, analysisLoading: false }))
        } catch (err) {
          setState((s) => ({
            ...s,
            analysisLoading: false,
            analysisError: toErrorMessage(err),
          }))
        }
      }
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const analyzeTrace = useCallback(async (traceId: number) => {
    setState((s) => ({ ...s, analysisLoading: true, analysisError: null, currentAnalysis: null }))
    try {
      const analysis = await analyzeMapTrace(traceId)
      setState((s) => ({ ...s, currentAnalysis: analysis, analysisLoading: false }))
      // Mettre à jour le statut de la trace locale si présent
      setState((s) =>
        s.currentTrace?.id === traceId
          ? { ...s, currentTrace: { ...s.currentTrace, status: 'analyzed' } }
          : s
      )
    } catch (err) {
      setState((s) => ({
        ...s,
        analysisLoading: false,
        analysisError: toErrorMessage(err),
      }))
    }
  }, [])

  const clearCurrent = useCallback(() => {
    setState((s) => ({
      ...s,
      currentTrace: null,
      currentAnalysis: null,
      analysisError: null,
    }))
  }, [])

  return { ...state, fetchAll, fetchOne, analyzeTrace, clearCurrent }
}
