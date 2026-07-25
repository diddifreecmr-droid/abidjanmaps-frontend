// Types TypeScript pour la requête/réponse de l'API de routage
// Contrat API — voir document "Contrat API — AbidjanMaps"

export interface RouteRequest {
  start: { lat: number; lng: number }
  end: { lat: number; lng: number }
  profile: 'car'
}

export interface RouteGeometry {
  type: 'LineString'
  coordinates: [number, number][] // [lng, lat]
}

export interface RouteSuccessResponse {
  status: 'ok'
  route: {
    geometry: RouteGeometry
    distance_m: number
    duration_s: number
  }
  price: {
    amount: number
    currency: string
  }
}

export type RouteErrorCode =
  | 'invalid_request'
  | 'no_route_found'
  | 'out_of_coverage'
  | 'internal_error'
  | 'invalid_routing_response'
  | 'routing_engine_unavailable'
  | 'routing_timeout'

export interface RouteErrorResponse {
  status: 'error'
  code: RouteErrorCode
  message: string
}

export type RouteResponse = RouteSuccessResponse | RouteErrorResponse

// Erreur levée côté client par les fonctions api/* — porte le code HTTP
// et le code métier, pour que useRouteQuery puisse choisir le bon message

// --- Nouveau : POST /api/v1/routes/proposals (itinéraires multiples) ---

export interface ScoreBreakdownBase {
  distance_component: number
  duration_component: number
  base_score: number
}

export interface ScoreBreakdownPenalties {
  blocked: number
  degraded: number
  flood: number
  control: number
  unsafe_night: number
  narrow_width: number
  toll: number
  seasonal: number
  vehicle: number
}

export interface ScoreBreakdownVehicleConstraints {
  profile: string
  width_m: number
  weight_t: number
  forbidden: boolean
  overweight: boolean
  too_wide: boolean
  eligible: boolean
}

export interface ScoreBreakdown {
  base: ScoreBreakdownBase
  penalties: ScoreBreakdownPenalties
  vehicle_constraints: ScoreBreakdownVehicleConstraints
  total_score: number
}

export interface EnrichmentFactors {
  blocked: boolean
  degraded: boolean
  flood_risk: boolean
  control_point: boolean
  unsafe_night: boolean
  narrow_width: boolean
  toll_present: boolean
  requested_vehicle_profile: string
  vehicle_width_m: number
  vehicle_weight_t: number
  vehicle_forbidden: boolean
  vehicle_overweight: boolean
  vehicle_too_wide: boolean
  seasonal_risk_multiplier: number
  vehicle_profile_multiplier: number
}

// Forme exacte pas encore confirmée (toujours vide dans les exemples reçus).
// Typage volontairement permissif en attendant un exemple non vide.
export interface RouteEnrichmentTroncon {
  road_id?: number
  name?: string
  [key: string]: unknown
}

export interface RouteEnrichmentReport {
  id?: number
  report_type?: string
  severity?: number
  message?: string
  [key: string]: unknown
}

export interface RouteEnrichment {
  factors: EnrichmentFactors
  troncons: RouteEnrichmentTroncon[]
  reports: RouteEnrichmentReport[]
}

export interface RouteProposal {
  route: {
    geometry: RouteGeometry
    distance_m: number
    duration_s: number
  }
  price: {
    amount: number
    currency: string
  }
  score: number
  rank: number
  score_breakdown: ScoreBreakdown
  enrichment: RouteEnrichment | null
}

export interface RouteProposalsSuccessResponse {
  status: string
  proposals: RouteProposal[]
}

export class RouteApiError extends Error {
  httpStatus: number
  code: RouteErrorCode

  constructor(httpStatus: number, code: RouteErrorCode, message: string) {
    super(message)
    this.httpStatus = httpStatus
    this.code = code
  }
}