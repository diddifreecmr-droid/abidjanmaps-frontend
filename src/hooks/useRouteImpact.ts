import type { EnrichmentFactors, RouteProposal } from '../types/route'

export interface RouteImpactReason {
  key: keyof EnrichmentFactors
  label: string
}

export interface RouteImpactResult {
  /** Facteurs qui concernent l'itinéraire actuellement sélectionné/affiché */
  currentReasons: RouteImpactReason[]
  /** Explication "le trajet le plus court a été évité", si applicable */
  shortestAvoided: {
    distanceDiffKm: number
    reasons: RouteImpactReason[]
  } | null
}

// Libellés en français, alignés sur les exemples du PRD.
// (seuls les facteurs pertinents pour une explication "simple" sont repris)
const FACTOR_LABELS: Partial<Record<keyof EnrichmentFactors, string>> = {
  blocked: 'route bloquée',
  degraded: 'route fortement dégradée',
  flood_risk: "risque d'inondation",
  control_point: 'point de contrôle sur le trajet',
  unsafe_night: 'route non sécurisée la nuit',
  narrow_width: 'route trop étroite pour ce véhicule',
  toll_present: 'présence d\'un péage',
}

function extractReasons(factors?: EnrichmentFactors | null): RouteImpactReason[] {
  if (!factors) return []
  return (Object.keys(FACTOR_LABELS) as Array<keyof EnrichmentFactors>)
    .filter((key) => Boolean(factors[key]))
    .map((key) => ({ key, label: FACTOR_LABELS[key] as string }))
}

/**
 * Dérive une explication "simple" (PRD Phase 2) à partir des données
 * d'enrichissement déjà renvoyées par le backend pour chaque proposition.
 */
export function useRouteImpact(
  proposals: RouteProposal[],
  selectedIndex: number
): RouteImpactResult {
  const selected = proposals[selectedIndex]
  const currentReasons = extractReasons(selected?.enrichment?.factors)

  let shortestAvoided: RouteImpactResult['shortestAvoided'] = null

  if (selected && proposals.length > 1) {
    let shortestIndex = 0
    proposals.forEach((p, i) => {
      if (p.route.distance_m < proposals[shortestIndex].route.distance_m) {
        shortestIndex = i
      }
    })

    const shortest = proposals[shortestIndex]
    const isShortestButNotSelected =
      shortestIndex !== selectedIndex && shortest.route.distance_m < selected.route.distance_m

    if (isShortestButNotSelected) {
      const reasons = extractReasons(shortest.enrichment?.factors)
      if (reasons.length > 0) {
        shortestAvoided = {
          distanceDiffKm: (selected.route.distance_m - shortest.route.distance_m) / 1000,
          reasons,
        }
      }
    }
  }

  return { currentReasons, shortestAvoided }
}