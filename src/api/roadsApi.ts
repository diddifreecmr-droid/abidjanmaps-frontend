import {
  type RoadCreate,
  type RoadRead,
  type RoadHistoryEntry,
  type RoadsListResponse,
  LocalDataApiError,
  type LocalDataErrorResponse,
} from '../types/localData'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function handleResponse<T>(response: Response): Promise<T> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new LocalDataApiError(502, 'parse_error', 'Réponse du serveur illisible.')
  }

  if (!response.ok || (body as { status?: string })?.status === 'error') {
    const err = body as Partial<LocalDataErrorResponse>
    throw new LocalDataApiError(response.status, err.code ?? 'unknown', err.message ?? 'Erreur serveur')
  }

  return body as T
}

export async function fetchRoads(params?: {
  status?: 'proposed' | 'validated' | 'rejected'
  limit?: number
  offset?: number
}): Promise<RoadsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.offset) searchParams.set('offset', String(params.offset))

  const url = `${API_BASE_URL}/api/v1/roads?${searchParams.toString()}`
  const response = await fetch(url, { headers: getAuthHeaders() })
  return handleResponse<RoadsListResponse>(response)
}

export async function createRoad(road: RoadCreate): Promise<RoadRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(road),
  })
  return handleResponse<RoadRead>(response)
}

export async function getRoad(id: number): Promise<RoadRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<RoadRead>(response)
}

export async function validateRoad(id: number): Promise<RoadRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads/${id}/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<RoadRead>(response)
}

export async function rejectRoad(id: number): Promise<RoadRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<RoadRead>(response)
}

export async function fetchRoadHistory(id: number): Promise<RoadHistoryEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads/${id}/history`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<RoadHistoryEntry[]>(response)
}

export async function fetchRoadsTaxonomy(): Promise<Record<string, string[]>> {
  const response = await fetch(`${API_BASE_URL}/api/v1/roads/taxonomy`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<Record<string, string[]>>(response)
}