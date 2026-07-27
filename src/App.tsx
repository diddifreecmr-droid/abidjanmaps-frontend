import { useEffect, useState } from 'react'
import MapView from './components/MapView'
import SelectionPanel from './components/SelectionPanel'
import JourneyTracker from './components/JourneyTracker'
import { LayerControl } from './components/LayerControl'
import { AdminValidationPanel } from './components/AdminValidationPanel'
import { AddRoadPanel } from './components/AddRoadPanel'
import { AddPlacePanel } from './components/AddPlacePanel'
import { RouteReportPanel } from './components/RouteReportPanel'
import { LoginPanel } from './components/LoginPanel'
import { HealthPanel } from './components/HealthPanel'
import { useHealth } from './hooks/useHealth'
import { UsersAdminPanel } from './components/UsersAdminPanel'
import { useUsers } from './hooks/useUsers'
import { useRoutePoints } from './hooks/useRoutePoints'
import type { RoutePoint } from './hooks/useRoutePoints'
import { useRouteProposals } from './hooks/useRouteProposals'
import type { VehicleProfile } from './types/route'
import { useJourneyTracking } from './hooks/useJourneyTracking'
import { useRoads, useLayerVisibility } from './hooks/useRoads'
import { usePlaces } from './hooks/usePlaces'
import { useRouteReports } from './hooks/useRouteReports'
import type { RoadCreate, PlaceCreate, RouteReportCreate } from './types/localData'
import {
  login as authLogin,
  fetchProfile,
  getStoredUser,
  logout as authLogout,
  isLoggedIn,
  type UserProfile,
} from './api/authApi'

type AppMode = 'route' | 'add-road' | 'add-place' | 'report-road'

function App() {
  const { pointA, pointB, setPointA, setPointB, handleMapClick, reset: resetPoints } = useRoutePoints()
  const {
    proposals,
    selectedIndex,
    loading,
    errorCode,
    calculateProposals,
    selectProposal,
    reset: resetProposals,
  } = useRouteProposals()

  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile>('car')
  const [vehicleWidthM, setVehicleWidthM] = useState<number | undefined>(undefined)
  const [vehicleWeightT, setVehicleWeightT] = useState<number | undefined>(undefined)
  const [focusPoint, setFocusPoint] = useState<RoutePoint | null>(null)
  const {
    status: journeyStatus,
    elapsedSeconds,
    distanceMeters,
    startJourney,
    finishJourney,
    reset: resetJourney,
  } = useJourneyTracking()

const { roads, loading: roadsLoading, fetchAll: fetchRoads, validate: validateRoad, reject: rejectRoad, create: createRoad, update: updateRoad } = useRoads()
  const { places, loading: placesLoading, fetchAll: fetchPlaces, validate: validatePlace, reject: rejectPlace, create: createPlace, update: updatePlace } = usePlaces()
  const { visibility, toggleLayer } = useLayerVisibility()
  const { create: createRouteReport } = useRouteReports()
  const { backend: healthBackend, database: healthDatabase, check: checkHealth } = useHealth()
  const [showHealthPanel, setShowHealthPanel] = useState(false)

  const handleToggleHealthPanel = () => {
    setShowHealthPanel((prev) => {
      const next = !prev
      if (next) checkHealth()
      return next
    })
  }

  const { users, loading: usersLoading, error: usersError, fetchAll: fetchUsersAll, create: createUser } = useUsers()
  const [showUsersPanel, setShowUsersPanel] = useState(false)

  const handleToggleUsersPanel = () => {
    setShowUsersPanel((prev) => {
      const next = !prev
      if (next) fetchUsersAll()
      return next
    })
  }
  const [mode, setMode] = useState<AppMode>('route')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showLoginPanel, setShowLoginPanel] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(getStoredUser())
  const [loginError, setLoginError] = useState<string>()

  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>([])
  const [placeCoordinate, setPlaceCoordinate] = useState<[number, number] | undefined>()
  const [reportCoordinate, setReportCoordinate] = useState<[number, number] | undefined>()

  // On mount: if token exists, verify it with /users/me
  useEffect(() => {
    if (isLoggedIn()) {
      fetchProfile()
        .then(setUser)
        .catch(() => {
          // Token invalid — already cleared by fetchProfile
          setUser(null)
        })
    }
    fetchRoads('validated')
    fetchPlaces('validated')
  }, [fetchRoads, fetchPlaces])

  const canCalculate = Boolean(pointA && pointB) && !loading

  const handleCalculate = () => {
    if (pointA && pointB) {
      calculateProposals(pointA, pointB, {
        profile: vehicleProfile,
        vehicleWidthM: vehicleProfile === 'truck' ? vehicleWidthM : undefined,
        vehicleWeightT: vehicleProfile === 'truck' ? vehicleWeightT : undefined,
      })
    }
  }

  const handleReset = () => {
    resetPoints()
    resetProposals()
  }

  const routeGeometries = proposals.map((p) => p.route.geometry)

  const handleRefreshAdmin = () => {
    fetchRoads('proposed')
    fetchPlaces('proposed')
  }

  const handleMapClickForMode = (point: { lat: number; lng: number }) => {
    if (mode === 'route') {
      handleMapClick(point)
    } else if (mode === 'add-road') {
      setRoadCoordinates(prev => [...prev, [point.lng, point.lat]])
    } else if (mode === 'add-place') {
      setPlaceCoordinate([point.lng, point.lat])
    } else if (mode === 'report-road') {
      setReportCoordinate([point.lng, point.lat])
    }
  }

  const handleAddRoad = async (road: RoadCreate) => {
    try {
      await createRoad(road)
      setMode('route')
      setRoadCoordinates([])
      alert('Route proposée avec succès! Elle sera examinée par un administrateur.')
    } catch (err) {
      alert('Erreur lors de la proposition de la route: ' + (err instanceof Error ? err.message : 'Erreur inconnue'))
    }
  }

  const handleAddPlace = async (place: PlaceCreate) => {
    try {
      await createPlace(place)
      setMode('route')
      setPlaceCoordinate(undefined)
      alert('Lieu proposé avec succès! Il sera examiné par un administrateur.')
    } catch (err) {
      alert('Erreur lors de la proposition du lieu: ' + (err instanceof Error ? err.message : 'Erreur inconnue'))
    }
  }

  const handleAddRouteReport = async (report: RouteReportCreate) => {
    try {
      await createRouteReport(report)
      setMode('route')
      setReportCoordinate(undefined)
      alert('Signalement envoyé avec succès! Il sera examiné par un administrateur.')
    } catch (err) {
      alert('Erreur lors de l\'envoi du signalement: ' + (err instanceof Error ? err.message : 'Erreur inconnue'))
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const userProfile = await authLogin(email, password)
      setUser(userProfile)
      setShowLoginPanel(false)
      setLoginError(undefined)
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  const handleLogout = () => {
    authLogout()
    setUser(null)
    setShowAdminPanel(false)
    setMode('route')
  }

  const handleCancelAdd = () => {
    setMode('route')
    setRoadCoordinates([])
    setPlaceCoordinate(undefined)
    setReportCoordinate(undefined)
  }

  return (
    <div className="h-screen w-screen relative">
  <MapView
        pointA={pointA}
        pointB={pointB}
        routeGeometries={routeGeometries}
        selectedRouteIndex={selectedIndex}
        onMapClick={handleMapClickForMode}
        onPointADrag={setPointA}
        onPointBDrag={setPointB}
        roads={roads}
        places={places}
        layerVisibility={visibility}
        mode={mode}
        draftRoadCoordinates={roadCoordinates}
        draftPlaceCoordinate={placeCoordinate}
        focusPoint={focusPoint}
      />

{/* Top Bar */}
      <div className="absolute top-4 left-4 right-16 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center space-x-3">
              <span className="text-sm font-medium">{user.email}</span>
              <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {user.role}
              </span>
              <button onClick={handleLogout} className="text-xs text-red-600 hover:text-red-800">
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginPanel(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              Connexion
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setMode('route')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'route' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Itinéraire
          </button>
          {user && (
            <>
              <button
                onClick={() => setMode('add-road')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'add-road' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                + Route
              </button>
              <button
                onClick={() => setMode('add-place')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'add-place' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                + Lieu
              </button>
              <button
                onClick={() => setMode('report-road')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'report-road' ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Signaler
              </button>
            </>
          )}
        </div>

       <button
          onClick={handleToggleHealthPanel}
          className={`px-3 py-2 rounded-lg shadow text-sm transition-colors ${showHealthPanel ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          title="Diagnostic backend / base de données"
        >
          🩺 Diagnostic
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={handleToggleUsersPanel}
            className={`px-3 py-2 rounded-lg shadow text-sm transition-colors ${showUsersPanel ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            title="Administration des utilisateurs"
          >
            👤 Utilisateurs
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className={`px-4 py-2 rounded-lg shadow transition-colors ${showAdminPanel ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          >
            {showAdminPanel ? 'Fermer Admin' : 'Panneau Admin'}
          </button>
        )}
      </div>

      {mode !== 'route' && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`px-4 py-2 rounded-lg shadow text-white font-medium ${mode === 'add-road' ? 'bg-green-600' : mode === 'add-place' ? 'bg-cyan-600' : 'bg-orange-600'}`}>
            {mode === 'add-road'
              ? `Mode: Ajout de route (${roadCoordinates.length} points)`
              : mode === 'add-place'
              ? 'Mode: Ajout de lieu'
              : 'Mode: Signalement de route'}
          </div>
        </div>
      )}

      {showLoginPanel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <LoginPanel onLogin={handleLogin} onCancel={() => setShowLoginPanel(false)} error={loginError} />
        </div>
      )}

{(showHealthPanel || showUsersPanel || (showAdminPanel && user?.role === 'admin')) && (
        <div className="absolute top-20 right-16 z-10 flex flex-col items-end gap-2">
          {showHealthPanel && (
            <HealthPanel
              backend={healthBackend}
              database={healthDatabase}
              onCheck={checkHealth}
              onClose={() => setShowHealthPanel(false)}
            />
          )}

          {showUsersPanel && user?.role === 'admin' && (
            <UsersAdminPanel
              users={users}
              loading={usersLoading}
              error={usersError}
              onCreate={async (u) => { await createUser(u) }}
              onRefresh={fetchUsersAll}
              onClose={() => setShowUsersPanel(false)}
            />
          )}

          {showAdminPanel && user?.role === 'admin' && (
            <div className="w-96">
              <AdminValidationPanel
                roads={roads}
                places={places}
                loading={roadsLoading || placesLoading}
                onValidateRoad={validateRoad}
                onRejectRoad={rejectRoad}
                onValidatePlace={validatePlace}
                onRejectPlace={rejectPlace}
                onUpdateRoad={async (id, patch) => { await updateRoad(id, patch) }}
                onUpdatePlace={async (id, patch) => { await updatePlace(id, patch) }}
                onFocusPoint={setFocusPoint}
                onRefresh={handleRefreshAdmin}
              />
            </div>
          )}
        </div>
      )}

      <div className="fixed md:absolute bottom-0 md:top-20 left-0 md:left-4 right-0 md:right-auto z-10 space-y-2">
        {mode === 'route' && (
          <>
 <SelectionPanel
              pointA={pointA}
              pointB={pointB}
              loading={loading}
              canCalculate={canCalculate}
              proposals={proposals}
              selectedIndex={selectedIndex}
              errorCode={errorCode}
              onCalculate={handleCalculate}
              onReset={handleReset}
              onSelectProposal={selectProposal}
              onSelectPointA={setPointA}
              onSelectPointB={setPointB}
              vehicleProfile={vehicleProfile}
              onVehicleProfileChange={setVehicleProfile}
              vehicleWidthM={vehicleWidthM}
              onVehicleWidthMChange={setVehicleWidthM}
              vehicleWeightT={vehicleWeightT}
              onVehicleWeightTChange={setVehicleWeightT}
            />
            <JourneyTracker
              status={journeyStatus}
              elapsedSeconds={elapsedSeconds}
              distanceMeters={distanceMeters}
              onStart={startJourney}
              onFinish={finishJourney}
              onReset={resetJourney}
            />
            <LayerControl visibility={visibility} onToggle={toggleLayer} />
          </>
        )}

        {mode === 'add-road' && (
          <AddRoadPanel
            onSubmit={handleAddRoad}
            onCancel={handleCancelAdd}
            selectedCoordinates={roadCoordinates.length > 0 ? roadCoordinates : undefined}
          />
        )}

        {mode === 'add-place' && (
          <AddPlacePanel
            onSubmit={handleAddPlace}
            onCancel={handleCancelAdd}
            selectedCoordinate={placeCoordinate}
          />
        )}

        {mode === 'report-road' && (
          <RouteReportPanel
            roads={roads}
            selectedPoint={reportCoordinate ? { lng: reportCoordinate[0], lat: reportCoordinate[1] } : undefined}
            onSubmit={handleAddRouteReport}
            onCancel={handleCancelAdd}
          />
        )}
      </div>
    </div>
  )
}

export default App