import type { RoadRead, PlaceRead } from '../types/localData'

interface AdminValidationPanelProps {
  roads: RoadRead[]
  places: PlaceRead[]
  loading: boolean
  onValidateRoad: (id: number) => void
  onRejectRoad: (id: number) => void
  onValidatePlace: (id: number) => void
  onRejectPlace: (id: number) => void
  onRefresh: () => void
}

export function AdminValidationPanel({
  roads,
  places,
  loading,
  onValidateRoad,
  onRejectRoad,
  onValidatePlace,
  onRejectPlace,
  onRefresh,
}: AdminValidationPanelProps) {
  const safeRoads = roads || []
  const safePlaces = places || []
 const proposedRoads = safeRoads.filter((r) => r.validation_status === 'proposed')
  const proposedPlaces = safePlaces.filter((p) => p.validation_status === 'proposed')

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Validation des données</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}