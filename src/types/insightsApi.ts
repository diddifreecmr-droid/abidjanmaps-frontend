export type InsightStatus = 'proposed' | 'validated' | 'rejected'

export type InsightType =
  | 'duration_much_longer_than_planned'
  | 'slow_journey'
  | 'possible_slow_segment'
  | 'possible_blocked_road'
  | 'possible_detour'
  | 'gps_time_gap'
  | 'suspicious_gps_jump'

export interface MapTraceInsight {
  id: number
  trace_id: number
  analysis_id: number | null
  insight_type: InsightType | string
  severity: number
  confidence_score: number | null
  message: string
  duplicate_key: string | null
  evidence_count: number
  latest_evidence_trace_id: number | null
  status: InsightStatus
}

// Champs supplémentaires renvoyés par /review-queue
export interface MapTraceInsightQueueItem extends MapTraceInsight {
  review_priority_score: number | null
  recommended_action: string | null
  conversion_ready: boolean
}
