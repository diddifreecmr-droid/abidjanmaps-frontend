import type { RouteSuccessResponse } from '../types/route'

interface ResultCardProps {
  data: RouteSuccessResponse
}

function formatDistance(distance_m: number): string {
  return `${(distance_m / 1000).toFixed(2)} km`
}

function formatDuration(duration_s: number): string {
  const minutes = Math.round(duration_s / 60)
  return `${minutes} min`
}

function formatPrice(amount: number, currency: string): string {
  // Formatage FCFA lisible : séparateur de milliers, pas de décimales
  const formatted = new Intl.NumberFormat('fr-FR').format(Math.round(amount))
  return `${formatted} ${currency}`
}

function ResultCard({ data }: ResultCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Distance</span>
        <span className="font-medium text-gray-900">{formatDistance(data.route.distance_m)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Durée estimée</span>
        <span className="font-medium text-gray-900">{formatDuration(data.route.duration_s)}</span>
      </div>
      <div className="flex justify-between text-sm pt-1.5 border-t border-gray-200">
        <span className="text-gray-500">Prix estimé</span>
        <span className="font-semibold text-gray-900">
          {formatPrice(data.price.amount, data.price.currency)}
        </span>
      </div>
    </div>
  )
}

export default ResultCard