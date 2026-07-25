import { useState } from 'react'
import type { RoadCreate } from '../types/localData'

interface AddRoadPanelProps {
  onSubmit: (road: RoadCreate) => void
  onCancel: () => void
  selectedCoordinates?: [number, number][]
}

export function AddRoadPanel({ onSubmit, onCancel, selectedCoordinates }: AddRoadPanelProps) {
  const [name, setName] = useState('')
  const [surfaceState, setSurfaceState] = useState('')
  const [seasonalPracticability, setSeasonalPracticability] = useState('')
  const [surfaceReel, setSurfaceReel] = useState('')
  const [pointControle, setPointControle] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [eclairage, setEclairage] = useState<number | null>(null)
  const [securiteNuit, setSecuriteNuit] = useState<number | null>(null)
  const [widthUsableM, setWidthUsableM] = useState<number | null>(null)
 const [extraMetadata] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !selectedCoordinates || selectedCoordinates.length < 2) {
      alert('Veuillez tracer une route sur la carte (minimum 2 points)')
      return
    }
    if (!surfaceState || !seasonalPracticability) {
      alert('Veuillez remplir l\'état de surface et la praticabilité saisonnière')
      return
    }

    const road: RoadCreate = {
      name,
      geometry: {
        type: 'LineString',
        coordinates: selectedCoordinates,
      },
      surface_state: surfaceState,
      seasonal_practicability: seasonalPracticability,
      surface_reel: surfaceReel || null,
      point_controle: pointControle || null,
      is_blocked: isBlocked,
      eclairage: eclairage,
      securite_nuit: securiteNuit,
      width_usable_m: widthUsableM,
      extra_metadata: extraMetadata ? JSON.parse(extraMetadata) : undefined,
    }

    onSubmit(road)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-4">Ajouter une route</h3>
      
      {!selectedCoordinates || selectedCoordinates.length < 2 ? (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
          Cliquez sur la carte pour tracer la route (minimum 2 points)
        </div>
      ) : (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded mb-4">
          {selectedCoordinates.length} points sélectionnés
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la route *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Boulevard de la République"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">État de surface *</label>
          <input
            type="text"
            value={surfaceState}
            onChange={(e) => setSurfaceState(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Asphalte bon état, Latérite dégradée..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Praticabilité saisonnière *</label>
          <input
            type="text"
            value={seasonalPracticability}
            onChange={(e) => setSeasonalPracticability(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Toute saison, Saison sèche uniquement..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surface réelle</label>
          <input
            type="text"
            value={surfaceReel}
            onChange={(e) => setSurfaceReel(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Latérite, Terre, Asphalte..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Point de contrôle</label>
          <input
            type="text"
            value={pointControle}
            onChange={(e) => setPointControle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Police, Douane, Mixte..."
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isBlocked}
              onChange={(e) => setIsBlocked(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Route bloquée</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Éclairage (0-5)</label>
            <input
              type="number"
              min={0}
              max={5}
              value={eclairage ?? ''}
              onChange={(e) => setEclairage(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sécurité nuit (0-5)</label>
            <input
              type="number"
              min={0}
              max={5}
              value={securiteNuit ?? ''}
              onChange={(e) => setSecuriteNuit(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Largeur utilisable (m)</label>
          <input
            type="number"
            value={widthUsableM ?? ''}
            onChange={(e) => setWidthUsableM(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Proposer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}