import type { HealthStatus } from '../api/healthApi'

interface HealthCheckState {
  data: HealthStatus | null
  loading: boolean
  error: string | null
}

interface HealthPanelProps {
  backend: HealthCheckState
  database: HealthCheckState
  onCheck: () => void
  onClose: () => void
}

function StatusRow({ label, state }: { label: string; state: HealthCheckState }) {
  const isOk = state.data?.status === 'ok'
  const dotClass = state.loading
    ? 'bg-gray-300 animate-pulse'
    : state.error
    ? 'bg-red-500'
    : isOk
    ? 'bg-green-500'
    : 'bg-amber-500'

  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <span className={`mt-1 inline-block w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {state.loading && <div className="text-xs text-gray-400">Vérification…</div>}
        {!state.loading && state.error && (
          <div className="text-xs text-red-600 break-words">{state.error}</div>
        )}
        {!state.loading && !state.error && state.data && (
          <div className="text-xs text-gray-500">
            {state.data.service}
            {state.data.routing_engine && ` · moteur: ${state.data.routing_engine}`}
            {state.data.database && ` · base: ${state.data.database}`}
          </div>
        )}
      </div>
    </div>
  )
}

export function HealthPanel({ backend, database, onCheck, onClose }: HealthPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Diagnostic</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          ✕
        </button>
      </div>

      <StatusRow label="Backend / moteur de routage" state={backend} />
      <StatusRow label="Base de données (PostGIS)" state={database} />

      <button
        onClick={onCheck}
        className="w-full mt-3 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Relancer le diagnostic
      </button>
    </div>
  )
}