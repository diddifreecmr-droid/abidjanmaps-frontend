import { useState } from 'react'
import { useEntityHistory } from '../hooks/useEntityHistory'
import { useIsMobile } from '../hooks/useIsMobile'
import HistoryList from './HistoryList'
import { EditPlacePanel } from './EditPlacePanel'
import { EditRoadPanel } from './EditRoadPanel'
import type { RoadUpdate } from '../api/roadsApi'
import type { PlaceUpdate } from '../api/placesApi'
import type { RoadRead, PlaceRead } from '../types/localData'
import type { RoutePoint } from '../hooks/useRoutePoints'

interface AdminValidationPanelProps {
  roads: RoadRead[]
  places: PlaceRead[]
  loading: boolean
  onValidateRoad: (id: number) => void
  onRejectRoad: (id: number) => void
  onValidatePlace: (id: number) => void
  onRejectPlace: (id: number) => void
  onUpdateRoad: (id: number, patch: RoadUpdate) => Promise<void>
  onUpdatePlace: (id: number, patch: PlaceUpdate) => Promise<void>
onFocusPoint: (point: RoutePoint) => void
  onRefresh: () => void
  onClose: () => void
}

function getRoadFocusPoint(road: RoadRead): RoutePoint {
  const coords = road.geometry.coordinates
  const [lng, lat] = coords[Math.floor(coords.length / 2)]
  return { lat, lng }
}

export function AdminValidationPanel({
  roads,
  places,
  loading,
  onValidateRoad,
  onRejectRoad,
  onValidatePlace,
  onRejectPlace,
 onUpdateRoad,
  onUpdatePlace,
onFocusPoint,
  onRefresh,
  onClose,
}: AdminValidationPanelProps) {
  const safeRoads = roads || []
  const safePlaces = places || []
 const proposedRoads = safeRoads.filter((r) => r.validation_status === 'proposed')
  const proposedPlaces = safePlaces.filter((p) => p.validation_status === 'proposed')

 const { load: loadHistory, getState: getHistoryState } = useEntityHistory()
  const isMobile = useIsMobile()
  const [openHistoryKeys, setOpenHistoryKeys] = useState<Set<string>>(new Set())

  const [editingRoad, setEditingRoad] = useState<RoadRead | null>(null)
  const [editingPlace, setEditingPlace] = useState<PlaceRead | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const handleSubmitRoadEdit = async (id: number, patch: RoadUpdate) => {
    setSavingEdit(true)
    try {
      await onUpdateRoad(id, patch)
      setEditingRoad(null)
    } catch {
      // L'erreur est déjà remontée via l'état `error` du hook parent (useRoads) ;
      // on garde le formulaire ouvert pour laisser l'utilisateur corriger et réessayer.
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSubmitPlaceEdit = async (id: number, patch: PlaceUpdate) => {
    setSavingEdit(true)
    try {
      await onUpdatePlace(id, patch)
      setEditingPlace(null)
    } catch {
      // idem
    } finally {
      setSavingEdit(false)
    }
  }
  const toggleHistory = (type: 'road' | 'place', id: number) => {
    const key = `${type}:${id}`
    setOpenHistoryKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
        loadHistory(type, id)
      }
      return next
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Validation des données</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
            title="Fermer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Roads Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Routes proposées ({proposedRoads.length})
        </h4>
        {proposedRoads.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucune route en attente</p>
        ) : (
          <div className="space-y-2">
            {proposedRoads.map((road) => (
              <div key={road.id} className="border rounded p-3 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{road.name}</p>
                    <p className="text-xs text-gray-500">
                      Surface: {road.surface_state} | Praticabilité: {road.seasonal_practicability}
                    </p>
                    {road.surface_reel && (
                      <p className="text-xs text-gray-400 mt-1">Surface réelle: {road.surface_reel}</p>
                    )}
                    {road.is_blocked && (
                      <p className="text-xs text-red-500 mt-1">⚠️ Route bloquée</p>
                    )}
                  </div>
<div className="flex space-x-2">
                    <button
                      onClick={() => onFocusPoint(getRoadFocusPoint(road))}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      title="Centrer la carte sur cette route"
                    >
                      📍 Carte
                    </button>
                    <button
                      onClick={() => setEditingRoad(road)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleHistory('road', road.id)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      {openHistoryKeys.has(`road:${road.id}`) ? 'Masquer' : 'Historique'}
                    </button>
                    <button
                      onClick={() => onValidateRoad(road.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => onRejectRoad(road.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
                {openHistoryKeys.has(`road:${road.id}`) && (
                  <HistoryList
                    entries={getHistoryState('road', road.id).entries}
                    loading={getHistoryState('road', road.id).loading}
                    error={getHistoryState('road', road.id).error}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    

      {/* Places Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Lieux proposés ({proposedPlaces.length})
        </h4>
        {proposedPlaces.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucun lieu en attente</p>
        ) : (
          <div className="space-y-2">
            {proposedPlaces.map((place) => (
              <div key={place.id} className="border rounded p-3 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{place.name}</p>
                    {place.aliases && place.aliases.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Alias: {place.aliases.join(', ')}
                      </p>
                    )}
                    {place.description && (
                      <p className="text-xs text-gray-400 mt-1">{place.description}</p>
                    )}
                  </div>
        <div className="flex space-x-2">
                    <button
                      onClick={() => onFocusPoint(place.location)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      title="Centrer la carte sur ce lieu"
                    >
                      📍 Carte
                    </button>
                    <button
                      onClick={() => setEditingPlace(place)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleHistory('place', place.id)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      {openHistoryKeys.has(`place:${place.id}`) ? 'Masquer' : 'Historique'}
                    </button>
                    <button
                      onClick={() => onValidatePlace(place.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => onRejectPlace(place.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
                {openHistoryKeys.has(`place:${place.id}`) && (
                  <HistoryList
                    entries={getHistoryState('place', place.id).entries}
                    loading={getHistoryState('place', place.id).loading}
                    error={getHistoryState('place', place.id).error}
                  />
                )}
              </div>
            ))}
          </div>
        )}
</div>
{editingRoad && (
        <div
          className={
            isMobile
              ? 'fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto py-8 px-4 [&>div]:w-full [&>div]:max-w-sm [&>div]:max-h-none'
              : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
          }
        >
          <EditRoadPanel
            road={editingRoad}
            onSubmit={handleSubmitRoadEdit}
            onCancel={() => setEditingRoad(null)}
            submitting={savingEdit}
          />
        </div>
      )}

      {editingPlace && (
        <div
          className={
            isMobile
              ? 'fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto py-8 px-4 [&>div]:w-full [&>div]:max-w-sm [&>div]:max-h-none'
              : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
          }
        >
          <EditPlacePanel
            place={editingPlace}
            onSubmit={handleSubmitPlaceEdit}
            onCancel={() => setEditingPlace(null)}
            submitting={savingEdit}
          />
        </div>
      )}
    </div>
  )
}