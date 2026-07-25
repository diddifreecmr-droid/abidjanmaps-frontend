import { useRouteImpact } from '../hooks/useRouteImpact'
import { RouteImpactNotice } from './RouteImpactNotice'
import type { RoutePoint } from '../hooks/useRoutePoints'
import type { RouteErrorCode, RouteProposal } from '../types/route'
import ProposalsList from './ProposalsList'
import LoadingState from './LoadingState'
import ErrorBanner from './ErrorBanner'

interface SelectionPanelProps {
  pointA: RoutePoint | null
  pointB: RoutePoint | null
  loading: boolean
  canCalculate: boolean
  proposals: RouteProposal[]
  selectedIndex: number
  errorCode: RouteErrorCode | null
  onCalculate: () => void
  onReset: () => void
  onSelectProposal: (index: number) => void
}

function formatPoint(point: RoutePoint | null): string {
  return point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : 'non posé'
}

function SelectionPanel({
  pointA,
  pointB,
  loading,
  canCalculate,
  proposals,
  selectedIndex,
  errorCode,
  onCalculate,
  onReset,
  onSelectProposal,
}: SelectionPanelProps) {
  const impact = useRouteImpact(proposals, selectedIndex)
  return (
    <div className="bg-white shadow-lg p-4 w-full md:w-72 rounded-t-2xl md:rounded-lg space-y-3 text-sm max-h-[70vh] md:max-h-none overflow-y-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
          <span className="text-gray-700">Point A : {formatPoint(pointA)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-600" />
          <span className="text-gray-700">Point B : {formatPoint(pointB)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onCalculate}
          disabled={!canCalculate}
          className="w-full bg-blue-600 disabled:bg-gray-300 text-white rounded px-3 py-2 transition-colors"
        >
          Calculer l'itinéraire
        </button>

        <button
          onClick={onReset}
          className="w-full border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          Recalculer
        </button>
      </div>

      {loading && <LoadingState />}

      {!loading && proposals.length > 0 && (
        <>
          <ProposalsList proposals={proposals} selectedIndex={selectedIndex} onSelect={onSelectProposal} />
          <RouteImpactNotice impact={impact} />
        </>
      )}

      {errorCode && !loading && <ErrorBanner code={errorCode} />}
    </div>
  )
}

export default SelectionPanel