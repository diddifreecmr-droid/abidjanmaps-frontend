import type { MapTrace } from '../types/mapTracesApi'

interface MyTracesPanelProps {
  traces: MapTrace[]
  loading: boolean
  error: string | null
  onFetch: () => void
  onViewDetail: (traceId: number) => void
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
  return `${m} min`
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

export function MyTracesPanel({
  traces,
  loading,
  error,
  onFetch,
  onViewDetail,
  onClose,
}: MyTracesPanelProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-80 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">Mes collectes GPS</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onFetch}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40"
          >
            Actualiser
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-blue-600 py-4 justify-center">
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

      {!loading && !error && traces.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-gray-400 text-xs">Aucune collecte pour le moment.</p>
          <button
            onClick={onFetch}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Charger mes collectes
          </button>
        </div>
      )}

      {!loading && traces.length > 0 && (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {traces.map((trace) => (
            <li
              key={trace.id}
              className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span>{profileIcon(trace.profile)}</span>
                    <span className="font-medium text-gray-800">
                      {profileLabel(trace.profile)}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
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

                  <p className="text-xs text-gray-500">{fmtDate(trace.started_at)}</p>

                  <div className="flex gap-3 mt-1.5 text-xs text-gray-600">
                    <span>
                      {trace.actual_distance_m != null
                        ? fmtDist(trace.actual_distance_m)
                        : fmtDist(trace.planned_distance_m)}
                    </span>
                    <span>
                      {trace.actual_duration_s != null
                        ? fmtDur(trace.actual_duration_s)
                        : fmtDur(trace.planned_duration_s)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onViewDetail(trace.id)}
                  className="shrink-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded px-2 py-1 transition-colors"
                >
                  Détail
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyTracesPanel
