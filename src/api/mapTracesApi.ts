import { getAuthHeaders } from './authApi'
import { LocalDataApiError } from '../types/localData'
import type {
  MapTrace,
  MapTraceDetail,
  MapTraceStart,
  MapTraceFinishPayload,
  MapTracePosition,
  MapTracePositionCreate,
  MapTraceAnalysis,
} from '../types/mapTracesApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

export async function startMapTrace(payload: MapTraceStart): Promise<MapTrace> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<MapTrace>(response)
}

export async function addMapTracePositions(
  traceId: number,
  positions: MapTracePositionCreate[]
): Promise<MapTracePosition[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/${traceId}/positions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ positions }),
  })
  return handleResponse<MapTracePosition[]>(response)
}

export async function finishMapTrace(
  traceId: number,
  payload?: MapTraceFinishPayload
): Promise<MapTrace> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/${traceId}/finish`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload ?? {}),
  })
  return handleResponse<MapTrace>(response)
}

export async function fetchMapTrace(traceId: number): Promise<MapTraceDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/${traceId}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<MapTraceDetail>(response)
}

export async function fetchMapTraces(): Promise<MapTrace[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<MapTrace[]>(response)
}

// --- Phase 3 V2 ---

export async function analyzeMapTrace(traceId: number): Promise<MapTraceAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/${traceId}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  return handleResponse<MapTraceAnalysis>(response)
}

export async function fetchMapTraceAnalysis(traceId: number): Promise<MapTraceAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/v1/map-traces/${traceId}/analysis`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<MapTraceAnalysis>(response)
}
