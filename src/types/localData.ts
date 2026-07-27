// ==================== GEOMETRY ====================

export interface GeoPointGeometry {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface GeoLineStringGeometry {
  type: 'LineString'
  coordinates: [number, number][] // [[lng, lat], ...]
}

// ==================== ROADS (matches backend RoadCreateSchema / RoadReadSchema) ====================

export interface RoadCreate {
  name: string
  geometry: GeoLineStringGeometry
  surface_state: string
  seasonal_practicability: string
  surface_reel?: string | null
  tonnage_max_reel_t?: number | null
  point_controle?: string | null
  temps_attente_p50_s?: number | null
  temps_attente_p90_s?: number | null
  eclairage?: number | null
  securite_nuit?: number | null
  width_usable_m?: number | null
  pente_max_pct?: number | null
  type_flux?: string | null
  allowed_vehicle_profiles?: string[]
  is_blocked?: boolean
  extra_metadata?: Record<string, unknown>
}

// Champs réellement renvoyés par le backend (vérifié via openapi.json) :
// pas de `status` (c'est `validation_status`), pas de `version`,
// `proposed_by` ni `validated_by` (le versionnement passe par /history).
export interface RoadRead extends RoadCreate {
  id: number
  validation_status: 'proposed' | 'validated' | 'rejected'
  created_at?: string | null
  updated_at?: string | null
}
export interface RoadHistoryEntry {
  id: number
  road_id: number
  field_name: string
  old_value: unknown
  new_value: unknown
  changed_by: number | null
  changed_at: string
}

export type RoadsListResponse = RoadRead[]

// ==================== PLACES (matches backend PlaceCreateSchema / PlaceReadSchema) ====================

// Format plat attendu par le backend pour un point (PAS du GeoJSON).
// À ne pas confondre avec GeoPointGeometry, utilisé uniquement pour
// l'affichage carte côté MapLibre.
export interface LatLngPoint {
  lat: number
  lng: number
}

export interface PlaceCreate {
  name: string
  category: string
  location: LatLngPoint
  aliases?: string[]
  vernacular_name?: string | null
  description?: string | null
  extra_metadata?: Record<string, unknown>
}

// Champs réellement renvoyés par le backend (vérifié via openapi.json) :
// `category` (pas `place_type`), `location` en {lat,lng} (pas GeoJSON),
// `verified`, `validation_status` (pas `status`), pas de `version`.
export interface PlaceRead extends PlaceCreate {
  id: number
  verified: boolean
  validation_status: 'proposed' | 'validated' | 'rejected'
  created_at?: string | null
  updated_at?: string | null
}

export interface PlaceHistoryEntry {
  id: number
  place_id: number
  field_name: string
  old_value: unknown
  new_value: unknown
  changed_by: number | null
  changed_at: string
}

export type PlacesListResponse = PlaceRead[]

// ==================== LAYER VISIBILITY ====================

export interface LayerVisibility {
  road_condition: boolean
  flood_risk: boolean
  blocked_roads: boolean
  control_points: boolean
  tolls: boolean
  congestion: boolean
  local_places: boolean
}

// ==================== API ERRORS ====================

export interface LocalDataErrorResponse {
  code?: string
  message?: string
  detail?: string
}

export class LocalDataApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'LocalDataApiError'
    this.status = status
    this.code = code
  }
}

// ==================== ROUTE REPORTS (matches backend /api/v1/route-reports) ====================

export interface RouteReportGeometry {
  lng: number
  lat: number
}

export interface RouteReportCreate {
  road_id?: number | null
  report_type: string
  severity: number
  message: string
  geometry?: RouteReportGeometry | null
  extra_metadata?: Record<string, unknown>
}

export interface RouteReportRead {
  id: number
  road_id?: number | null
  report_type: string
  severity: number
  message: string
  geometry?: RouteReportGeometry | null
  extra_metadata?: Record<string, unknown>
  reported_by?: string | null
  validation_status: string
  reviewed_by?: string | null
  reviewed_at?: string | null
  reported_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}