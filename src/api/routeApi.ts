import { RouteApiError, type RouteErrorCode, type RouteErrorResponse, type RouteRequest, type RouteSuccessResponse } from '../types/route'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL n\'est pas défini — vérifie ton fichier .env')
}

export async function fetchRoute(request: RouteRequest): Promise<RouteSuccessResponse> {
  console.log('[DEBUG] fetchRoute — URL appelée :', `${API_BASE_URL}/api/v1/route`)
  console.log('[DEBUG] fetchRoute — payload envoyé :', request)

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    console.log('[DEBUG] fetchRoute — statut HTTP reçu :', response.status)
  } catch (networkErr) {
    console.error('[DEBUG] fetchRoute — échec réseau :', networkErr)
    throw new RouteApiError(503, 'routing_engine_unavailable', 'Impossible de contacter le service de routage.')
  }

  let body: unknown
  try {
    body = await response.json()
    console.log('[DEBUG] fetchRoute — corps de la réponse :', body)
  } catch (parseErr) {
    console.error('[DEBUG] fetchRoute — échec de parsing JSON :', parseErr)
    throw new RouteApiError(502, 'invalid_routing_response', 'Réponse du serveur illisible.')
  }

  if (!response.ok || (body as { status?: string })?.status === 'error') {
    const errBody = body as Partial<RouteErrorResponse>
    const code: RouteErrorCode = errBody.code ?? 'internal_error'
    const message = errBody.message ?? 'Erreur inconnue du serveur.'
    throw new RouteApiError(response.status, code, message)
  }

  return body as RouteSuccessResponse
}