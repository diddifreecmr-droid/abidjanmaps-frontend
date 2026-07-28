import { useCallback, useState } from 'react'
import {
  fetchInsightReviewQueue,
  fetchInsightCandidates,
  fetchInsights,
  validateInsight,
  rejectInsight,
  convertInsightToRouteReport,
} from '../api/insightsApi'
import { LocalDataApiError } from '../types/localData'
import type { MapTraceInsight, MapTraceInsightQueueItem, InsightStatus } from '../types/insightsApi'

interface InsightsState {
  reviewQueue: MapTraceInsightQueueItem[]
  candidates: MapTraceInsight[]
  allInsights: MapTraceInsight[]
  loading: boolean
  error: string | null
  actionLoading: number | null
  actionError: string | null
  lastConverted: number | null
}

function toErrorMessage(err: unknown): string {
  if (err instanceof LocalDataApiError) {
    if (err.status === 401) return 'Session expirée. Veuillez vous reconnecter.'
    if (err.status === 403) return 'Accès réservé aux administrateurs.'
    if (err.status === 404) return 'Insight introuvable.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Erreur inconnue'
}

export function useInsights() {
  const [state, setState] = useState<InsightsState>({
    reviewQueue: [],
    candidates: [],
    allInsights: [],
    loading: false,
    error: null,
    actionLoading: null,
    actionError: null,
    lastConverted: null,
  })

  const fetchReviewQueue = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const reviewQueue = await fetchInsightReviewQueue()
      setState((s) => ({ ...s, reviewQueue, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const fetchCandidates = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const candidates = await fetchInsightCandidates()
      setState((s) => ({ ...s, candidates, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const fetchAll = useCallback(async (status?: InsightStatus) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const allInsights = await fetchInsights({ status, sort: 'priority', order: 'desc' })
      setState((s) => ({ ...s, allInsights, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: toErrorMessage(err) }))
    }
  }, [])

  const validate = useCallback(async (id: number) => {
    setState((s) => ({ ...s, actionLoading: id, actionError: null }))
    try {
      const updated = await validateInsight(id)
      setState((s) => ({
        ...s,
        actionLoading: null,
        reviewQueue: s.reviewQueue.filter((i) => i.id !== id),
        allInsights: s.allInsights.map((i) => (i.id === id ? updated : i)),
      }))
    } catch (err) {
      setState((s) => ({ ...s, actionLoading: null, actionError: toErrorMessage(err) }))
    }
  }, [])

  const reject = useCallback(async (id: number) => {
    setState((s) => ({ ...s, actionLoading: id, actionError: null }))
    try {
      const updated = await rejectInsight(id)
      setState((s) => ({
        ...s,
        actionLoading: null,
        reviewQueue: s.reviewQueue.filter((i) => i.id !== id),
        allInsights: s.allInsights.map((i) => (i.id === id ? updated : i)),
      }))
    } catch (err) {
      setState((s) => ({ ...s, actionLoading: null, actionError: toErrorMessage(err) }))
    }
  }, [])

  const convert = useCallback(async (id: number) => {
    setState((s) => ({ ...s, actionLoading: id, actionError: null, lastConverted: null }))
    try {
      await convertInsightToRouteReport(id)
      setState((s) => ({
        ...s,
        actionLoading: null,
        lastConverted: id,
        candidates: s.candidates.filter((i) => i.id !== id),
      }))
    } catch (err) {
      setState((s) => ({ ...s, actionLoading: null, actionError: toErrorMessage(err) }))
    }
  }, [])

  const clearActionError = useCallback(() => {
    setState((s) => ({ ...s, actionError: null }))
  }, [])

  return {
    ...state,
    fetchReviewQueue,
    fetchCandidates,
    fetchAll,
    validate,
    reject,
    convert,
    clearActionError,
  }
}
