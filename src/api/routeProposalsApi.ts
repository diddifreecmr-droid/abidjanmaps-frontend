import { RouteApiError, type RouteErrorCode, type RouteProposal, type RouteProposalsSuccessResponse, type RouteRequest } from '../types/route'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL n\'est pas défini — vérifie ton fichier .env')
}

interface FastApiValidationError {
  detail?: { msg?: string }[]
}

export async function fetchRouteProposals(request: RouteRequest): Promise<RouteProposal[]> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/routes/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    throw new RouteApiError(503, 'routing_engine_unavailable', 'Impossible de contacter le service de routage.')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new RouteApiError(502, 'invalid_routing_response', 'Réponse du serveur illisible.')
  }

  if (response.status === 422) {
    const validationBody = body as FastApiValidationError
    const message =
      validationBody.detail
        ?.map((d) => d.msg)
        .filter(Boolean)
        .join(' ; ') || 'Requête invalide.'
    throw new RouteApiError(422, 'invalid_request', message)
  }

  if (!response.ok || (body as { status?: string })?.status === 'error') {
    const errBody = body as Partial<{ code: RouteErrorCode; message: string }>
    const code: RouteErrorCode = errBody.code ?? 'internal_error'
    const message = errBody.message ?? 'Erreur inconnue du serveur.'
    throw new RouteApiError(response.status, code, message)
  }

  const parsed = body as RouteProposalsSuccessResponse
  return parsed.proposals
}