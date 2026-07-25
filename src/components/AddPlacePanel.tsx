import { useState } from 'react'
import type { PlaceCreate } from '../types/localData'

interface AddPlacePanelProps {
  onSubmit: (place: PlaceCreate) => void
  onCancel: () => void
  selectedCoordinate?: [number, number]
}

export function AddPlacePanel({ onSubmit, onCancel, selectedCoordinate }: AddPlacePanelProps) {
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !selectedCoordinate) {
      alert('Veuillez cliquer sur la carte pour sélectionner un emplacement')
      return
    }
    if (!category) {
      alert('Veuillez préciser une catégorie (ex: carrefour, marché, gare...)')
      return
    }

    // selectedCoordinate est au format [lng, lat] (convention carte/GeoJSON).
    // Le backend attend un objet plat { lat, lng }, pas du GeoJSON.
    const [lng, lat] = selectedCoordinate

    onSubmit({
      name,
      category,
      location: { lat, lng },
      aliases: aliases.split(',').map(a => a.trim()).filter(Boolean),
      description,
    })
  }
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80">
      <h3 className="font-semibold text-gray-800 mb-4">Ajouter un lieu</h3>
      
      {!selectedCoordinate ? (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
          Cliquez sur la carte pour sélectionner l'emplacement
        </div>
      ) : (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded mb-4">
          Position sélectionnée: {selectedCoordinate[1].toFixed(4)}, {selectedCoordinate[0].toFixed(4)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du lieu</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Ex: Carrefour de l'Indénié"
            required
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
            placeholder="Ex: carrefour, marché, gare..."
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
            placeholder="Description du lieu..."
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
