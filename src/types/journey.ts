// Types pour le suivi de parcours (Phase 1 — fonction de test/collecte, pas une course VTC)

export interface JourneyPosition {
  lat: number
  lng: number
  timestamp: number
}

export interface StartJourneyResponse {
  journey_id: string
}

export interface FinishJourneySummary {
  duration_s: number
  distance_m: number
}

export interface FinishJourneyResponse extends FinishJourneySummary {
  journey_id: string
}