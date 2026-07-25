import type { RouteImpactResult } from '../hooks/useRouteImpact'

interface RouteImpactNoticeProps {
  impact: RouteImpactResult
}

export function RouteImpactNotice({ impact }: RouteImpactNoticeProps) {
  const { currentReasons, shortestAvoided } = impact

  if (currentReasons.length === 0 && !shortestAvoided) {
    return null
  }

  return (
    <div className="space-y-2">
      {shortestAvoided && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">
            Le trajet le plus court a été évité ({shortestAvoided.distanceDiffKm.toFixed(1)} km de plus) :
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {shortestAvoided.reasons.map((reason) => (
              <li key={reason.key}>{reason.label}</li>
            ))}
          </ul>
        </div>
      )}

      {currentReasons.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <p className="font-medium mb-1">Cet itinéraire est concerné par :</p>
          <ul className="list-disc list-inside space-y-0.5">
            {currentReasons.map((reason) => (
              <li key={reason.key}>{reason.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}