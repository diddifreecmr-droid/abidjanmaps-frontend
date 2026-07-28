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

// --- Phase 3 V2 : Analyse des traces GPS ---

export type QualityLabel = 'good' | 'average' | 'poor'
export type AnalysisRecommendation = 'ok' | 'review_needed' | 'discard'

export interface MapTraceAnalysisEvent {
  type: string
  severity: number
  message: string
}

export interface MapTraceAnalysis {
  trace_id: number
  status: string
  points_count: number | null
  usable_points_count: number | null
  quality_score: number | null
  quality_label: QualityLabel | null
  actual_distance_m: number | null
  actual_duration_s: number | null
  average_speed_kmh: number | null
  phone_average_speed_kmh: number | null
  moving_time_s: number | null
  stopped_time_s: number | null
  max_speed_kmh: number | null
  gps_gap_count: number | null
  suspicious_jump_count: number | null
  planned_distance_m: number | null
  planned_duration_s: number | null
  distance_delta_m: number | null
  duration_delta_s: number | null
  duration_ratio: number | null
  detected_events: MapTraceAnalysisEvent[]
  recommendation: AnalysisRecommendation | null
}