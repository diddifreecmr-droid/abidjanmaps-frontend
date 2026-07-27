import type { EnrichmentFactors, RouteProposal } from '../types/route'

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

interface RiskBadgeConfig {
  key: keyof EnrichmentFactors
  label: string
  className: string
}

// Badges courts recommandés par le briefing (section "Recommandation UI")
const RISK_BADGES: RiskBadgeConfig[] = [
  { key: 'blocked', label: 'Bloquée', className: 'bg-red-100 text-red-800' },
  { key: 'flood_risk', label: 'Inondable', className: 'bg-blue-100 text-blue-800' },
  { key: 'control_point', label: 'Contrôle', className: 'bg-amber-100 text-amber-800' },
  { key: 'narrow_width', label: 'Étroit', className: 'bg-orange-100 text-orange-800' },
  { key: 'unsafe_night', label: 'Nuit', className: 'bg-purple-100 text-purple-800' },
  { key: 'toll_present', label: 'Péage', className: 'bg-gray-200 text-gray-800' },
]

function getRiskBadges(factors?: EnrichmentFactors | null): RiskBadgeConfig[] {
  if (!factors) return []
  return RISK_BADGES.filter((b) => Boolean(factors[b.key]))
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
            <div className="flex gap-3 text-sm text-gray-500 mb-1.5">
              <span>{formatDistance(proposal.route.distance_m)}</span>
              <span>·</span>
              <span>{formatDuration(proposal.route.duration_s)}</span>
            </div>
            {(() => {
              const badges = getRiskBadges(proposal.enrichment?.factors)
              if (badges.length === 0) return null
              return (
                <div className="flex flex-wrap gap-1">
                  {badges.map((badge) => (
                    <span
                      key={badge.key}
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )
            })()}
          </button>
        )
      })}
    </div>
  )
}

export default ProposalsList