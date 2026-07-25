interface JourneyTrackerProps {
  status: 'idle' | 'active' | 'finished'
  elapsedSeconds: number
  distanceMeters: number
  onStart: () => void
  onFinish: () => void
  onReset: () => void
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`
}

function JourneyTracker({ status, elapsedSeconds, distanceMeters, onStart, onFinish, onReset }: JourneyTrackerProps) {
  return (
    <div className="bg-white shadow-lg p-4 w-full md:w-72 rounded-lg space-y-2 text-sm">
      <p className="font-medium text-gray-900">Suivi de parcours</p>

      {status === 'idle' && (
        <button onClick={onStart} className="w-full bg-green-600 text-white rounded px-3 py-2">
          Démarrer le parcours
        </button>
      )}

      {status === 'active' && (
        <>
          <div className="flex justify-between text-gray-700">
            <span>Durée écoulée</span>
            <span className="font-medium">{formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Distance parcourue</span>
            <span className="font-medium">{formatDistance(distanceMeters)}</span>
          </div>
          <button onClick={onFinish} className="w-full bg-red-600 text-white rounded px-3 py-2">
            Terminer le parcours
          </button>
        </>
      )}

      {status === 'finished' && (
        <>
          <div className="flex justify-between text-gray-700">
            <span>Durée totale</span>
            <span className="font-medium">{formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Distance totale</span>
            <span className="font-medium">{formatDistance(distanceMeters)}</span>
          </div>
          <button onClick={onReset} className="w-full border border-gray-300 rounded px-3 py-2">
            Nouveau parcours
          </button>
        </>
      )}
    </div>
  )
}

export default JourneyTracker