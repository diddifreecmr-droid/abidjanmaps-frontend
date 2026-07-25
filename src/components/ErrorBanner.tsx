import type { RouteErrorCode } from '../types/route'

const ERROR_MESSAGES: Record<RouteErrorCode, string> = {
  invalid_request: 'Coordonnées invalides. Réessaie de poser les points A et B.',
  no_route_found: 'Aucun itinéraire trouvé entre ces deux points.',
  out_of_coverage: 'Un des points est en dehors de la zone couverte (Abidjan).',
  internal_error: 'Le service est indisponible pour le moment. Réessaie dans un instant.',
  invalid_routing_response: 'Réponse du moteur de routage invalide. Réessaie dans un instant.',
  routing_engine_unavailable: 'Le moteur de routage est momentanément indisponible.',
  routing_timeout: "Le calcul de l'itinéraire a pris trop de temps. Réessaie.",
}

interface ErrorBannerProps {
  code: RouteErrorCode
}

function ErrorBanner({ code }: ErrorBannerProps) {
  const message = ERROR_MESSAGES[code] ?? 'Une erreur inattendue est survenue.'

  return (
    <div className="flex gap-2 items-start rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </div>
  )
}

export default ErrorBanner