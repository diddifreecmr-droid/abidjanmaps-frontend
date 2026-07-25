import { ABIDJAN_BBOX } from '../config/map'
import { RouteApiError, type RouteRequest, type RouteSuccessResponse } from '../types/route'

// Constantes de tarification — PLACEHOLDER, à valider avec le backend
// avant la mise en production (formule réelle non encore confirmée).
const BASE_FARE = 500 // XOF
const FARE_PER_KM = 150 // XOF
const FARE_PER_MIN = 25 // XOF
const AVERAGE_SPEED_KMH = 25 // vitesse moyenne urbaine estimée pour le mock

function isWithinAbidjan(point: { lat: number; lng: number }): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = ABIDJAN_BBOX
  return (
    point.lng >= minLng && point.lng <= maxLng && point.lat >= minLat && point.lat <= maxLat
  )
}

function haversineDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function simulateNetworkDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock de l'appel POST /api/v1/route — respecte exactement le contrat API.
 * Remplacé par un vrai appel réseau (routeApi.ts) à l'Étape 11,
 * sans changer la signature ni le comportement attendu par useRouteQuery.
 */
export async function fetchRouteMock(request: RouteRequest): Promise<RouteSuccessResponse> {
  await simulateNetworkDelay()

  const { start, end } = request

  if (!start || !end || typeof start.lat !== 'number' || typeof end.lat !== 'number') {
    throw new RouteApiError(400, 'invalid_request', 'Coordonnées de départ ou d\'arrivée manquantes.')
  }

  if (!isWithinAbidjan(start) || !isWithinAbidjan(end)) {
    throw new RouteApiError(409, 'out_of_coverage', 'Un des points est en dehors de la zone couverte (Abidjan).')
  }

  const distance_m = haversineDistanceMeters(start, end)

  if (distance_m < 50) {
    throw new RouteApiError(404, 'no_route_found', 'Le départ et l\'arrivée sont trop proches pour calculer un itinéraire.')
  }

  const duration_s = Math.round((distance_m / 1000 / AVERAGE_SPEED_KMH) * 3600)
  const distance_km = distance_m / 1000
  const duration_min = duration_s / 60
  const amount = Math.round(BASE_FARE + distance_km * FARE_PER_KM + duration_min * FARE_PER_MIN)

  return {
    status: 'ok',
    route: {
      geometry: {
        type: 'LineString',
        // Ligne droite simplifiée pour le mock — le vrai OSRM renverra
        // la géométrie réelle suivant les routes à l'Étape 11.
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },
      distance_m: Math.round(distance_m),
      duration_s,
    },
    price: {
      amount,
      currency: 'XOF',
    },
  }
}