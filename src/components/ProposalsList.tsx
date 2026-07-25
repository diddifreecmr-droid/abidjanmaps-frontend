import type { RouteProposal } from '../types/route'

interface ProposalsListProps {
  proposals: RouteProposal[]
  selectedIndex: number
  onSelect: (index: number) => void
}

function formatDistance(distance_m: number): string {
  return `${(distance_m / 1000).toFixed(1)} km`
}

function formatDuration(duration_s: number): string {
  return `${Math.round(duration_s / 60)} min`
}

function formatPrice(amount: number, currency: string): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} ${currency}`
}

function ProposalsList({ proposals, selectedIndex, onSelect }: ProposalsListProps) {
  if (proposals.length === 0) return null

  return (
    <div className="space-y-2">
      {proposals.map((proposal, index) => {
        const isSelected = index === selectedIndex
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full text-left rounded-lg border p-3 transition-colors ${
              isSelected
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-900">Itinéraire {index + 1}</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(proposal.price.amount, proposal.price.currency)}
              </span>
            </div>
            <div className="flex gap-3 text-sm text-gray-500">
              <span>{formatDistance(proposal.route.distance_m)}</span>
              <span>·</span>
              <span>{formatDuration(proposal.route.duration_s)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ProposalsList