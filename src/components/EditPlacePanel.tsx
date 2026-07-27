import { useState } from 'react'
import type { PlaceRead } from '../types/localData'
import type { PlaceUpdate } from '../api/placesApi'

interface EditPlacePanelProps {
  place: PlaceRead
  onSubmit: (id: number, patch: PlaceUpdate) => void
  onCancel: () => void
  submitting?: boolean
}

export function EditPlacePanel({ place, onSubmit, onCancel, submitting }: EditPlacePanelProps) {
  const [name, setName] = useState(place.name)
  const [aliases, setAliases] = useState(place.aliases?.join(', ') ?? '')
  const [category, setCategory] = useState(place.category)
  const [description, setDescription] = useState(place.description ?? '')
  const [vernacularName, setVernacularName] = useState(place.vernacular_name ?? '')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !category) {
      alert('Le nom et la catégorie sont obligatoires')
      return
    }

    const patch: PlaceUpdate = {
      name,
      category,
      aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
      description: description || null,
      vernacular_name: vernacularName || null,
      ...(note.trim() ? { note: note.trim() } : {}),
    }

    onSubmit(place.id, patch)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-[28rem] overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-2">Modifier : {place.name}</h3>

      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-3">
        Toute modification remet ce lieu en statut « proposé » — il devra être revalidé par un admin.
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du lieu *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom vernaculaire</label>
          <input
            type="text"
            value={vernacularName}
            onChange={(e) => setVernacularName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nom local / familier"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alias (séparés par des virgules)</label>
          <input
            type="text"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Indénié, Grand carrefour"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            rows={3}
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
            placeholder="Ex: Nom corrigé suite à vérification terrain"
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