import type { MapTraceDetail } from '../types/mapTracesApi'

interface TraceDetailPanelProps {
  trace: MapTraceDetail | null
  loading: boolean
  error: string | null
  onBack: () => void
  onClose: () => void
}

function profileLabel(profile: string): string {
  if (profile === 'car') return 'Voiture'
  if (profile === 'motorcycle') return 'Moto'
  if (profile === 'truck') return 'Camion'
  return profile
}

function profileIcon(profile: string): string {
  if (profile === 'car') return '🚗'
  if (profile === 'motorcycle') return '🏍️'
  if (profile === 'truck') return '🚚'
  return '🚗'
}

function fmtDist(meters: number | null | undefined): string {
  if (meters == null) return '—'
  return `${(meters / 1000).toFixed(2)} km`
}

function fmtDur(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min ${String(s).padStart(2, '0')}s`
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function diffLabel(actual: number | null, planned: number | null, unit: 'dist' | 'dur'): string | null {
  if (actual == null || planned == null) return null
  const delta = actual - planned
  if (Math.abs(delta) < (unit === 'dist' ? 50 : 30)) return null

  const sign = delta > 0 ? '+' : ''
  if (unit === 'dist') return `${sign}${(delta / 1000).toFixed(2)} km`
  const m = Math.floor(Math.abs(delta) / 60)
  return `${delta > 0 ? '+' : '-'}${m}min`
}

export function TraceDetailPanel({ trace, loading, error, onBack, onClose }: TraceDetailPanelProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-80 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 p-0.5"
            aria-label="Retour"
          >
            ←
          </button>
          <p className="font-semibold text-gray-900">Détail de la collecte</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

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
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profileIcon(trace.profile)}</span>
            <div>
              <p className="font-medium text-gray-800">{profileLabel(trace.profile)}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  trace.status === 'finished'
                    ? 'bg-green-100 text-green-700'
                    : trace.status === 'analyzed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {trace.status === 'finished'
                  ? 'Terminée'
                  : trace.status === 'analyzed'
                  ? 'Analysée'
                  : 'En cours'}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>Démarré : {fmtDate(trace.started_at)}</p>
            {trace.finished_at && <p>Terminé : {fmtDate(trace.finished_at)}</p>}
          </div>

          {/* Comparaison prévu / réel */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Prévu vs Réel</p>

            <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-xs">
              <div className="text-gray-400 font-medium"></div>
              <div className="text-gray-400 font-medium text-center">Prévu</div>
              <div className="text-gray-400 font-medium text-center">Réel</div>

              <div className="text-gray-600">Distance</div>
              <div className="text-center font-medium">{fmtDist(trace.planned_distance_m)}</div>
              <div className="text-center font-medium text-green-700">
                {fmtDist(trace.actual_distance_m)}
                {diffLabel(trace.actual_distance_m, trace.planned_distance_m, 'dist') && (
                  <span className="block text-orange-500 text-xs">
                    {diffLabel(trace.actual_distance_m, trace.planned_distance_m, 'dist')}
                  </span>
                )}
              </div>

              <div className="text-gray-600">Durée</div>
              <div className="text-center font-medium">{fmtDur(trace.planned_duration_s)}</div>
              <div className="text-center font-medium text-green-700">
                {fmtDur(trace.actual_duration_s)}
                {diffLabel(trace.actual_duration_s, trace.planned_duration_s, 'dur') && (
                  <span className="block text-orange-500 text-xs">
                    {diffLabel(trace.actual_duration_s, trace.planned_duration_s, 'dur')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Points GPS */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Points GPS collectés</span>
            <span className="font-semibold text-gray-800">{trace.positions.length}</span>
          </div>

          {trace.positions.length < 5 && trace.status === 'finished' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-yellow-700 text-xs">
                Peu de points GPS collectés. La trace peut manquer de précision.
              </p>
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
