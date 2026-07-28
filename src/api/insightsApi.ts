import { getAuthHeaders } from './authApi'
import { LocalDataApiError } from '../types/localData'
import type { MapTraceInsight, MapTraceInsightQueueItem, InsightStatus } from '../types/insightsApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const BASE = `${API_BASE_URL}/api/v1/map-trace-insights`

interface ErrorBody {
  code?: string
  message?: string
  detail?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    if (response.ok) return undefined as T
    throw new LocalDataApiError(502, 'parse_error', 'Réponse du serveur illisible.')
  }
  if (!response.ok) {
    const err = body as ErrorBody
    throw new LocalDataApiError(
      response.status,
      err.code ?? String(response.status),
      err.message ?? err.detail ?? 'Erreur serveur'
    )
  }
  return body as T
}

export async function fetchInsightReviewQueue(): Promise<MapTraceInsightQueueItem[]> {
  const response = await fetch(`${BASE}/review-queue`, { headers: getAuthHeaders() })
  return handleResponse<MapTraceInsightQueueItem[]>(response)
}

export async function fetchInsightCandidates(): Promise<MapTraceInsight[]> {
  const response = await fetch(`${BASE}/route-report-candidates`, { headers: getAuthHeaders() })
  return handleResponse<MapTraceInsight[]>(response)
}

export async function fetchInsights(params?: {
  status?: InsightStatus
  sort?: 'priority' | 'severity' | 'evidence' | 'confidence' | 'newest'
  order?: 'asc' | 'desc'
}): Promise<MapTraceInsight[]> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.order) qs.set('order', params.order)
  const url = qs.toString() ? `${BASE}?${qs}` : BASE
  const response = await fetch(url, { headers: getAuthHeaders() })
  return handleResponse<MapTraceInsight[]>(response)
}

export async function validateInsight(id: number): Promise<MapTraceInsight> {
  const response = await fetch(`${BASE}/${id}/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  return handleResponse<MapTraceInsight>(response)
}

export async function rejectInsight(id: number): Promise<MapTraceInsight> {
  const response = await fetch(`${BASE}/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  return handleResponse<MapTraceInsight>(response)
}

export async function convertInsightToRouteReport(id: number): Promise<unknown> {
  const response = await fetch(`${BASE}/${id}/convert-to-route-report`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  return handleResponse<unknown>(response)
}
