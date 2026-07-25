/**
 * Mock implementation of roads API for development/testing.
 * Used when the backend is unavailable.
 */
import type { RoadRead, RoadsListResponse } from '../types/localData'

// In-memory mock data store
const mockRoads: RoadRead[] = [
  {
    id: 1,
    name: 'Boulevard de la République',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-4.008, 5.315],
        [-4.01, 5.32],
        [-4.012, 5.325],
      ],
    },
    surface_state: 'Asphalte bon état',
    seasonal_practicability: 'Toute saison',
    surface_reel: 'Asphalte',
    is_blocked: false,
    validation_status: 'validated',
    created_at: '2026-07-24T19:00:00Z',
    updated_at: '2026-07-24T19:00:00Z',
  },
  {
    id: 2,
    name: 'Rue des Jardins',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-4.02, 5.33],
        [-4.025, 5.335],
      ],
    },
    surface_state: 'Latérite dégradée',
    seasonal_practicability: 'Saison sèche uniquement',
    surface_reel: 'Latérite',
    is_blocked: false,
    validation_status: 'proposed',
    created_at: '2026-07-24T20:00:00Z',
    updated_at: '2026-07-24T20:00:00Z',
  },
  {
    id: 3,
    name: 'Avenue Charles de Gaulle',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-4.015, 5.34],
        [-4.018, 5.345],
        [-4.02, 5.35],
      ],
    },
    surface_state: 'Asphalte bon état',
    seasonal_practicability: 'Toute saison',
    surface_reel: 'Asphalte',
    point_controle: 'Police',
    is_blocked: false,
    validation_status: 'validated',
    created_at: '2026-07-24T18:00:00Z',
    updated_at: '2026-07-24T18:00:00Z',
  },
]

export async function fetchRoadsMock(params?: {
  status?: 'proposed' | 'validated' | 'rejected'
  limit?: number
  offset?: number
}): Promise<RoadsListResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = [...mockRoads]
  if (params?.status) {
    filtered = filtered.filter((r) => r.validation_status === params.status)
  }

  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 100

  // Renvoie un tableau brut, aligné sur le vrai contrat backend
  // (GET /api/v1/roads renvoie RoadRead[], pas {items, total})
  return filtered.slice(offset, offset + limit)
}

export async function validateRoadMock(id: number): Promise<RoadRead> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const road = mockRoads.find((r) => r.id === id)
  if (!road) throw new Error('Route non trouvée')

  road.validation_status = 'validated'
  road.updated_at = new Date().toISOString()
  return { ...road }
}

export async function rejectRoadMock(id: number): Promise<RoadRead> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const road = mockRoads.find((r) => r.id === id)
  if (!road) throw new Error('Route non trouvée')

  road.validation_status = 'rejected'
  road.updated_at = new Date().toISOString()
  return { ...road }
}