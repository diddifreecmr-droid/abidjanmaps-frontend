import type { MapTraceDetail, MapTraceAnalysis, QualityLabel, AnalysisRecommendation } from '../types/mapTracesApi'

interface TraceDetailPanelProps {
  trace: MapTraceDetail | null
  loading: boolean
  error: string | null
  analysis: MapTraceAnalysis | null
  analysisLoading: boolean
  analysisError: string | null
  onAnalyze: () => void
  onBack: () => void
  onClose: () => void
}

// --- Helpers ---

function profileLabel(p: string) {
  return p === 'car' ? 'Voiture' : p === 'motorcycle' ? 'Moto' : p === 'truck' ? 'Camion' : p
}
function profileIcon(p: string) {
  return p === 'car' ? '🚗' : p === 'motorcycle' ? '🏍️' : p === 'truck' ? '🚚' : '🚗'
}

function fmtDist(m: number | null | undefined): string {
  if (m == null) return '—'
  return `${(m / 1000).toFixed(2)} km`
}
function fmtDur(s: number | null | undefined): string {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}min ${String(sec).padStart(2, '0')}s`
}
function fmtSpeed(kmh: number | null | undefined): string {
  if (kmh == null) return '—'
  return `${kmh.toFixed(1)} km/h`
}
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function qualityConfig(label: QualityLabel | null): { text: string; cls: string } {
  if (label === 'good') return { text: 'Bonne trace', cls: 'bg-green-100 text-green-700' }
  if (label === 'average') return { text: 'Trace correcte', cls: 'bg-yellow-100 text-yellow-700' }
  if (label === 'poor') return { text: 'Trace faible', cls: 'bg-red-100 text-red-700' }
  return { text: '—', cls: 'bg-gray-100 text-gray-500' }
}

function recommendationConfig(rec: AnalysisRecommendation | null): { text: string; cls: string } {
  if (rec === 'ok') return { text: 'Valide', cls: 'bg-green-100 text-green-700' }
  if (rec === 'review_needed') return { text: 'À vérifier', cls: 'bg-orange-100 text-orange-700' }
  if (rec === 'discard') return { text: 'À écarter', cls: 'bg-red-100 text-red-700' }
  return { text: '—', cls: 'bg-gray-100 text-gray-500' }
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    slow_zone: 'Zone lente',
    slow_journey: 'Trajet lent',
    possible_slow_segment: 'Segment lent',
    duration_much_longer_than_planned: 'Durée bien dépassée',
    possible_blocked_road: 'Route potentiellement bloquée',
    possible_detour: 'Détour possible',
    gps_time_gap: 'Trou GPS',
    suspicious_gps_jump: 'Saut GPS filtré',
  }
  return labels[type] ?? type
}

function severityClass(severity: number): string {
  if (severity >= 4) return 'bg-red-100 text-red-700'
  if (severity === 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Score qualité</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}

// --- Composant principal ---

export function TraceDetailPanel({
  trace,
  loading,
  error,
  analysis,
  analysisLoading,
  analysisError,
  onAnalyze,
  onBack,
  onClose,
}: TraceDetailPanelProps) {
  const canAnalyze = trace?.status === 'finished' && !analysis && !analysisLoading

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-80 space-y-3 text-sm max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700" aria-label="Retour">
            ←
          </button>
          <p className="font-semibold text-gray-900">Détail de la collecte</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Fermer">
          ×
        </button>
      </div>

      {/* Loading trace */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-blue-600 py-6">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-xs">Chargement…</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      {!loading && !error && trace && (
        <>
          {/* Infos collecte */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profileIcon(trace.profile)}</span>
            <div>
              <p className="font-medium text-gray-800">{profileLabel(trace.profile)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                trace.status === 'finished' ? 'bg-green-100 text-green-700'
                : trace.status === 'analyzed' ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
              }`}>
                {trace.status === 'finished' ? 'Terminée' : trace.status === 'analyzed' ? 'Analysée' : 'En cours'}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-0.5">
            <p>Démarré : {fmtDate(trace.started_at)}</p>
            {trace.finished_at && <p>Terminé : {fmtDate(trace.finished_at)}</p>}
          </div>

          {/* Comparaison prévu / réel */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Prévu vs Réel</p>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-xs">
              <div className="text-gray-400" />
              <div className="text-gray-400 font-medium text-center">Prévu</div>
              <div className="text-gray-400 font-medium text-center">Réel</div>
              <div className="text-gray-600">Distance</div>
              <div className="text-center font-medium">{fmtDist(trace.planned_distance_m)}</div>
              <div className="text-center font-medium text-green-700">{fmtDist(trace.actual_distance_m)}</div>
              <div className="text-gray-600">Durée</div>
              <div className="text-center font-medium">{fmtDur(trace.planned_duration_s)}</div>
              <div className="text-center font-medium text-green-700">{fmtDur(trace.actual_duration_s)}</div>
            </div>
          </div>

          {/* Points GPS */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Points GPS collectés</span>
            <span className="font-semibold text-gray-800">{trace.positions.length}</span>
          </div>

          {trace.positions.length < 5 && trace.status !== 'started' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-yellow-700 text-xs">Peu de points GPS — la trace peut manquer de précision.</p>
            </div>
          )}

          {/* Bouton Analyser */}
          {canAnalyze && (
            <button
              onClick={onAnalyze}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              Analyser cette trace
            </button>
          )}

          {/* Chargement analyse */}
          {analysisLoading && (
            <div className="flex items-center gap-2 text-indigo-600 py-2 justify-center">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-xs">Analyse en cours…</span>
            </div>
          )}

          {/* Erreur analyse */}
          {analysisError && !analysisLoading && (
            <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
              <p className="text-red-600 text-xs">{analysisError}</p>
              <button
                onClick={onAnalyze}
                className="text-xs text-red-600 underline hover:text-red-800"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Résultats analyse */}
          {analysis && !analysisLoading && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Analyse GPS</p>

              {/* Badges qualité + recommandation */}
              <div className="flex gap-2 flex-wrap">
                {analysis.quality_label && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${qualityConfig(analysis.quality_label).cls}`}>
                    {qualityConfig(analysis.quality_label).text}
                  </span>
                )}
                {analysis.recommendation && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${recommendationConfig(analysis.recommendation).cls}`}>
                    {recommendationConfig(analysis.recommendation).text}
                  </span>
                )}
              </div>

              {/* Score qualité */}
              <ScoreBar score={analysis.quality_score} />

              {/* Vitesses */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                <p className="font-medium text-gray-600 mb-1">Vitesses</p>
                <StatRow label="Vitesse moyenne (GPS)" value={fmtSpeed(analysis.average_speed_kmh)} />
                <StatRow label="Vitesse moyenne (téléphone)" value={fmtSpeed(analysis.phone_average_speed_kmh)} />
                <StatRow label="Vitesse max" value={fmtSpeed(analysis.max_speed_kmh)} />
              </div>

              {/* Temps mouvement / arrêt */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                <p className="font-medium text-gray-600 mb-1">Temps</p>
                <StatRow label="En mouvement" value={fmtDur(analysis.moving_time_s)} />
                <StatRow label="À l'arrêt" value={fmtDur(analysis.stopped_time_s)} />
                {analysis.duration_ratio != null && (
                  <StatRow
                    label="Ratio durée réelle / prévue"
                    value={`×${analysis.duration_ratio.toFixed(2)}`}
                  />
                )}
              </div>

              {/* Qualité GPS */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                <p className="font-medium text-gray-600 mb-1">Qualité GPS</p>
                <StatRow
                  label="Points collectés"
                  value={`${analysis.points_count ?? '—'}`}
                />
                <StatRow
                  label="Points exploitables"
                  value={`${analysis.usable_points_count ?? '—'}`}
                />
                <StatRow
                  label="Trous GPS"
                  value={analysis.gps_gap_count != null
                    ? `${analysis.gps_gap_count} ${analysis.gps_gap_count === 0 ? '✓' : '⚠'}`
                    : '—'}
                />
                <StatRow
                  label="Sauts GPS filtrés"
                  value={analysis.suspicious_jump_count != null
                    ? `${analysis.suspicious_jump_count} ${analysis.suspicious_jump_count === 0 ? '✓' : '⚠'}`
                    : '—'}
                />
              </div>

              {/* Écarts distance / durée */}
              {(analysis.distance_delta_m != null || analysis.duration_delta_s != null) && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                  <p className="font-medium text-gray-600 mb-1">Écarts vs OSRM</p>
                  {analysis.distance_delta_m != null && (
                    <StatRow
                      label="Écart distance"
                      value={`${analysis.distance_delta_m > 0 ? '+' : ''}${(analysis.distance_delta_m / 1000).toFixed(2)} km`}
                    />
                  )}
                  {analysis.duration_delta_s != null && (
                    <StatRow
                      label="Écart durée"
                      value={`${analysis.duration_delta_s > 0 ? '+' : ''}${Math.round(analysis.duration_delta_s / 60)} min`}
                    />
                  )}
                </div>
              )}

              {/* Événements détectés */}
              {analysis.detected_events.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Événements détectés ({analysis.detected_events.length})
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.detected_events.map((ev, i) => (
                      <li key={i} className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityClass(ev.severity)}`}>
                            Sév. {ev.severity}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {eventTypeLabel(ev.type)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{ev.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.detected_events.length === 0 && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <span>✓</span>
                  <span>Aucun événement anormal détecté</span>
                </div>
              )}
            </div>
          )}

          {/* Légende carte */}
          <div className="border-t border-gray-100 pt-2 space-y-1.5 text-xs text-gray-500">
            <p className="font-medium text-gray-600">Sur la carte :</p>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t-2 border-dashed border-teal-500" />
              <span>Route prévue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t-2 border-orange-500" />
              <span>Trace GPS réelle</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TraceDetailPanel
