import type { RouteReportCreate, RouteReportRead } from '../types/localData'
import { LocalDataApiError, type LocalDataErrorResponse } from '../types/localData'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function handleResponse<T>(response: Response): Promise<T> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new LocalDataApiError(502, 'parse_error', 'Réponse du serveur illisible.')
  }

  if (!response.ok) {
    if (response.status === 422) {
      const detail = (body as { detail?: { msg?: string }[] })?.detail
      const message = detail?.map((d) => d.msg).filter(Boolean).join(' ; ') || 'Requête invalide.'
      throw new LocalDataApiError(422, 'invalid_request', message)
    }
    const err = body as Partial<LocalDataErrorResponse>
    throw new LocalDataApiError(response.status, err.code ?? 'unknown', err.message ?? err.detail ?? 'Erreur serveur')
  }

  return body as T
}

export async function fetchRouteReports(status?: 'proposed' | 'validated' | 'rejected'): Promise<RouteReportRead[]> {
  const searchParams = new URLSearchParams()
  if (status) searchParams.set('status', status)

  const url = `${API_BASE_URL}/api/v1/route-reports?${searchParams.toString()}`
  const response = await fetch(url, { headers: getAuthHeaders() })
  return handleResponse<RouteReportRead[]>(response)
}

export async function createRouteReport(report: RouteReportCreate): Promise<RouteReportRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/route-reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(report),
  })
  return handleResponse<RouteReportRead>(response)
}

export async function validateRouteReport(id: number, note?: string): Promise<RouteReportRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/route-reports/${id}/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note: note ?? '' }),
  })
  return handleResponse<RouteReportRead>(response)
}

export async function rejectRouteReport(id: number, note?: string): Promise<RouteReportRead> {
  const response = await fetch(`${API_BASE_URL}/api/v1/route-reports/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note: note ?? '' }),
  })
  return handleResponse<RouteReportRead>(response)
}

export async function fetchRouteReportsTaxonomy(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/api/v1/route-reports/taxonomy`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<Record<string, unknown>>(response)
}