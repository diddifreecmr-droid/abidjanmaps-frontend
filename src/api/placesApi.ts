import {
  type PlaceCreate,
  type PlaceRead,
  type PlaceHistoryEntry,
  type PlacesListResponse,
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

export async function fetchPlaces(params?: {
  status?: 'proposed' | 'validated' | 'rejected'
  limit?: number
  offset?: number
}): Promise<PlacesListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.offset) searchParams.set('offset', String(params.offset))

  const url = `${API_BASE_URL}/api/v1/places?${searchParams.toString()}`
  const response = await fetch(url, { headers: getAuthHeaders() })
  return handleResponse<PlacesListResponse>(response)
}

export async function searchPlaces(query: string, limit = 10): Promise<PlaceRead[]> {
  const searchParams = new URLSearchParams()
  searchParams.set('q', query)
  searchParams.set('limit', String(limit))

  const url = `${API_BASE_URL}/api/v1/places/search?${searchParams.toString()}`
  const response = await fetch(url, { headers: getAuthHeaders() })
  return handleResponse<PlaceRead[]>(response)
}

export async function createPlace(place: PlaceCreate): Promise<PlaceRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(place),
  })
  return handleResponse<PlaceRead>(response)
}

export async function getPlace(id: number): Promise<PlaceRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<PlaceRead>(response)
}

export interface PlaceUpdate extends Partial<PlaceCreate> {
  note?: string
}

export async function updatePlace(id: number, patch: PlaceUpdate): Promise<PlaceRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(patch),
  })
  return handleResponse<PlaceRead>(response)
}

export async function validatePlace(id: number): Promise<PlaceRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${id}/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<PlaceRead>(response)
}

export async function rejectPlace(id: number): Promise<PlaceRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<PlaceRead>(response)
}

export async function fetchPlaceHistory(id: number): Promise<PlaceHistoryEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${id}/history`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<PlaceHistoryEntry[]>(response)
}