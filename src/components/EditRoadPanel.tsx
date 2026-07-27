import { useState } from 'react'
import type { RoadRead } from '../types/localData'
import type { RoadUpdate } from '../api/roadsApi'

interface EditRoadPanelProps {
  road: RoadRead
  onSubmit: (id: number, patch: RoadUpdate) => void
  onCancel: () => void
  submitting?: boolean
}

export function EditRoadPanel({ road, onSubmit, onCancel, submitting }: EditRoadPanelProps) {
  const [name, setName] = useState(road.name)
  const [surfaceState, setSurfaceState] = useState(road.surface_state)
  const [seasonalPracticability, setSeasonalPracticability] = useState(road.seasonal_practicability)
  const [surfaceReel, setSurfaceReel] = useState(road.surface_reel ?? '')
  const [pointControle, setPointControle] = useState(road.point_controle ?? '')
  const [isBlocked, setIsBlocked] = useState(road.is_blocked ?? false)
  const [eclairage, setEclairage] = useState<number | null>(road.eclairage ?? null)
  const [securiteNuit, setSecuriteNuit] = useState<number | null>(road.securite_nuit ?? null)
  const [widthUsableM, setWidthUsableM] = useState<number | null>(road.width_usable_m ?? null)
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !surfaceState || !seasonalPracticability) {
      alert("Le nom, l'état de surface et la praticabilité saisonnière sont obligatoires")
      return
    }

    const patch: RoadUpdate = {
      name,
      surface_state: surfaceState,
      seasonal_practicability: seasonalPracticability,
      surface_reel: surfaceReel || null,
      point_controle: pointControle || null,
      is_blocked: isBlocked,
      eclairage,
      securite_nuit: securiteNuit,
      width_usable_m: widthUsableM,
      ...(note.trim() ? { note: note.trim() } : {}),
    }

    onSubmit(road.id, patch)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-[28rem] overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-2">Modifier : {road.name}</h3>

      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-3">
        Toute modification remet cette route en statut « proposée » — elle devra être revalidée par un admin.
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la route *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Point de contrôle</label>
          <input
            type="text"
            value={pointControle}
            onChange={(e) => setPointControle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isBlocked}
            onChange={(e) => setIsBlocked(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Route bloquée</span>
        </label>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (raison de la modification)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ex: Signalement vérifié sur place"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-md text-sm hover:bg-blue-700"
          >
            {submitting ? 'Envoi…' : 'Enregistrer'}
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