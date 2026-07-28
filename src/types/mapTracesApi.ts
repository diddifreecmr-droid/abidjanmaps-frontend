import type { RoutePoint } from '../hooks/useRoutePoints'
import type { VehicleProfile } from './route'

// Statut renvoyé par le backend sur une collecte (JourneyReadSchema.status)
// — à ne pas confondre avec l'état local de l'UI pendant la collecte (Étape 2).
export type MapTraceBackendStatus = 'started' | 'finished' | 'analyzed'

export interface MapTraceStart {
  start: RoutePoint
  end: RoutePoint
  profile: VehicleProfile
  planned_distance_m?: number | null
  planned_duration_s?: number | null
  planned_route_geometry?: Record<string, unknown> | null
}

export interface MapTrace {
  id: number
  user_id: number
  status: MapTraceBackendStatus
  profile: VehicleProfile
  start: RoutePoint
  end: RoutePoint
  planned_distance_m: number | null
  planned_duration_s: number | null
  planned_route_geometry: Record<string, unknown> | null
  actual_distance_m: number | null
  actual_duration_s: number | null
  started_at: string | null
  finished_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface MapTracePosition {
  id: number
  trace_id: number
  location: RoutePoint
  accuracy_m: number | null
  speed_mps: number | null
  recorded_at: string | null
  created_at: string | null
}

export interface MapTraceDetail extends MapTrace {
  positions: MapTracePosition[]
}

export interface MapTracePositionCreate {
  lat: number
  lng: number
  accuracy_m?: number | null
  speed_mps?: number | null
  recorded_at?: string | null
}

export interface MapTraceFinishPayload {
  finished_at?: string | null
}