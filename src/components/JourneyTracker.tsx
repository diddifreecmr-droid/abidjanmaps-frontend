import { useState } from 'react'
import type { TrackingStatus } from '../hooks/useJourneyTracking'
import type { MapTrace } from '../types/mapTracesApi'

interface JourneyTrackerProps {
  status: TrackingStatus
  elapsedSeconds: number
  distanceMeters: number
  error: string | null
  finishedTrace: MapTrace | null
  canStart: boolean
  isLoggedIn: boolean
  plannedDistanceM?: number | null
  plannedDurationS?: number | null
  onStart: () => void
  onFinish: () => void
  onReset: () => void
  onViewDetail: () => void
  onViewTraces: () => void
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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

function profileLabel(profile: string): string {
  if (profile === 'car') return 'Voiture'
  if (profile === 'motorcycle') return 'Moto'
  if (profile === 'truck') return 'Camion'
  return profile
}

export function JourneyTracker({
  status,
  elapsedSeconds,
  distanceMeters,
  error,
  finishedTrace,
  canStart,
  isLoggedIn,
  plannedDistanceM,
  plannedDurationS,
  onStart,
  onFinish,
  onReset,
  onViewDetail,
  onViewTraces,
}: JourneyTrackerProps) {
  const [confirmingFinish, setConfirmingFinish] = useState(false)

  const handleFinishClick = () => setConfirmingFinish(true)
  const handleFinishConfirm = () => {
    setConfirmingFinish(false)
    onFinish()
  }
  const handleFinishCancel = () => setConfirmingFinish(false)

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-72 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">Collecte GPS</p>
        {isLoggedIn && (status === 'idle' || status === 'finished' || status === 'failed') && (
          <button
            onClick={onViewTraces}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Mes collectes
          </button>
        )}
      </div>

      {/* IDLE */}
      {status === 'idle' && (
        <>
          {!isLoggedIn ? (
            <p className="text-gray-500 text-xs">Connectez-vous pour démarrer une collecte GPS.</p>
          ) : !canStart ? (
            <p className="text-gray-500 text-xs">Choisissez un départ et une destination pour démarrer.</p>
          ) : (
            <>
              {(plannedDistanceM != null || plannedDurationS != null) && (
                <div className="bg-gray-50 rounded p-2 space-y-1 text-xs text-gray-600">
                  {plannedDistanceM != null && (
                    <div className="flex justify-between">
                      <span>Distance prévue</span>
                      <span>{fmtDist(plannedDistanceM)}</span>
                    </div>
                  )}
                  {plannedDurationS != null && (
                    <div className="flex justify-between">
                      <span>Durée prévue</span>
                      <span>{fmtDur(plannedDurationS)}</span>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onStart}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 font-medium transition-colors"
              >
                Démarrer la collecte
              </button>
            </>
          )}
        </>
      )}

      {/* REQUESTING PERMISSION */}
      {status === 'requesting_permission' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>Demande d'accès au GPS…</span>
          </div>
          <p className="text-xs text-gray-500">Autorisez la localisation dans votre navigateur.</p>
        </div>
      )}

      {/* STARTING */}
      {status === 'starting' && (
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Démarrage de la collecte…</span>
        </div>
      )}

      {/* RECORDING */}
      {(status === 'recording' || status === 'syncing') && (
        <>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
            <span className={`text-xs font-medium ${status === 'syncing' ? 'text-yellow-600' : 'text-green-600'}`}>
              {status === 'syncing' ? 'Synchronisation…' : 'Collecte en cours'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Durée</span>
              <span className="font-mono font-medium">{fmt(elapsedSeconds)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Distance parcourue</span>
              <span className="font-medium">{fmtDist(distanceMeters)}</span>
            </div>
          </div>

          {!confirmingFinish ? (
            <button
              onClick={handleFinishClick}
              disabled={status === 'syncing'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 font-medium transition-colors"
            >
              Terminer la collecte
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-700 font-medium">Confirmer la fin de collecte ?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleFinishConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1.5 text-xs font-medium"
                >
                  Oui, terminer
                </button>
                <button
                  onClick={handleFinishCancel}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded px-3 py-1.5 text-xs"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* FINISHING */}
      {status === 'finishing' && (
        <div className="flex items-center gap-2 text-orange-600">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Finalisation de la collecte…</span>
        </div>
      )}

      {/* FINISHED */}
      {status === 'finished' && finishedTrace && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-600">Collecte terminée</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
            <p className="font-medium text-gray-700 mb-1">
              {profileLabel(finishedTrace.profile)} · Résumé
            </p>

            <div className="grid grid-cols-3 gap-1 text-center text-xs">
              <div className="text-gray-400 font-medium uppercase tracking-wide col-span-1"></div>
              <div className="text-gray-400 font-medium uppercase tracking-wide">Prévu</div>
              <div className="text-gray-400 font-medium uppercase tracking-wide">Réel</div>

              <div className="text-gray-600 text-left">Distance</div>
              <div className="font-medium">{fmtDist(finishedTrace.planned_distance_m)}</div>
              <div className="font-medium text-green-700">{fmtDist(finishedTrace.actual_distance_m)}</div>

              <div className="text-gray-600 text-left">Durée</div>
              <div className="font-medium">{fmtDur(finishedTrace.planned_duration_s)}</div>
              <div className="font-medium text-green-700">{fmtDur(finishedTrace.actual_duration_s)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onViewDetail}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              Voir le détail
            </button>
            <button
              onClick={onReset}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              Nouvelle collecte
            </button>
          </div>
        </>
      )}

      {/* FAILED */}
      {status === 'failed' && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-xs font-medium">Erreur</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={onReset}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 text-xs transition-colors"
          >
            Réessayer
          </button>
        </>
      )}
    </div>
  )
}

export default JourneyTracker
