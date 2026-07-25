import type { PlaceRead, PlacesListResponse } from '../types/localData'

const mockPlaces: PlaceRead[] = [
  {
    id: 1,
    name: 'Carrefour de l\'Indénié',
    aliases: ['Indénié', 'Grand carrefour', 'Carrefour Adjamé'],
    description: 'Carrefour principal d\'Adjamé',
    location: { lng: -4.0000, lat: 5.3200 },
    category: 'carrefour',
    verified: true,
    validation_status: 'validated',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Marché de Treichville',
    aliases: ['Treichville', 'Marché principal'],
    description: 'Grand marché de Treichville',
    location: { lng: -4.0167, lat: 5.3167 },
    category: 'marché',
    verified: true,
    validation_status: 'validated',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Gare de Bassam',
    aliases: ['Bassam', 'Gare'],
    description: 'Gare routière de Bassam',
    location: { lng: -3.9833, lat: 5.3233 },
    category: 'gare',
    verified: true,
    validation_status: 'validated',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

export async function fetchPlacesMock(params?: {
  status?: 'proposed' | 'validated' | 'rejected'
  limit?: number
  offset?: number
}): Promise<PlacesListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = mockPlaces
  if (params?.status) {
    filtered = mockPlaces.filter((p) => p.validation_status === params.status)
  }

  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 100

  // Renvoie un tableau brut, aligné sur le vrai contrat backend
  // (GET /api/v1/places renvoie PlaceRead[], pas {items, total})
  return filtered.slice(offset, offset + limit)
}

export async function searchPlacesMock(query: string): Promise<PlaceRead[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  
  const lowerQuery = query.toLowerCase()
  return mockPlaces.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.aliases?.some((a) => a.toLowerCase().includes(lowerQuery))
  )
}

export async function validatePlaceMock(id: number): Promise<PlaceRead> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const place = mockPlaces.find((p) => p.id === id)
  if (!place) throw new Error('Place not found')
  return { ...place, validation_status: 'validated' }
}

export async function rejectPlaceMock(id: number): Promise<PlaceRead> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const place = mockPlaces.find((p) => p.id === id)
  if (!place) throw new Error('Place not found')
  return { ...place, validation_status: 'rejected' }
}
