import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ABIDJAN_CENTER, ABIDJAN_BBOX, MAP_ZOOM, MAP_STYLE } from '../config/map'
import { useGeolocation } from '../hooks/useGeolocation'
import type { RoutePoint } from '../hooks/useRoutePoints'
import type { RouteGeometry } from '../types/route'
import type { RoadRead, PlaceRead, LayerVisibility } from '../types/localData'

const ROUTE_SOURCE_ID = 'route-lines-source'
const ROUTE_LAYER_ID = 'route-lines-layer'
const ROADS_SOURCE_ID = 'local-roads-source'
const ROADS_LAYER_ID = 'local-roads-layer'
const PLACES_SOURCE_ID = 'local-places-source'
const PLACES_LAYER_ID = 'local-places-layer'
const DRAFT_SOURCE_ID = 'draft-points-source'
const DRAFT_LAYER_ID = 'draft-points-layer'
const DRAFT_LINE_LAYER_ID = 'draft-line-layer'

function createMarkerElement(color: string) {
  const el = document.createElement('div')
  el.style.width = '16px'
  el.style.height = '16px'
  el.style.borderRadius = '50%'
  el.style.backgroundColor = color
  el.style.border = '3px solid white'
  el.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)'
  return el
}

function emptyGeoJsonSource(): maplibregl.SourceSpecification {
  return {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  }
}

interface MapViewProps {
  pointA: RoutePoint | null
  pointB: RoutePoint | null
  routeGeometries: RouteGeometry[]
  selectedRouteIndex: number
  onMapClick: (point: RoutePoint) => void
  onPointADrag: (point: RoutePoint) => void
  onPointBDrag: (point: RoutePoint) => void
  // Phase 2: Local data layers
  roads?: RoadRead[]
  places?: PlaceRead[]
  layerVisibility?: LayerVisibility
  // Draft/Editing mode
  mode?: 'route' | 'add-road' | 'add-place' | 'report-road'
  draftRoadCoordinates?: [number, number][]
  draftPlaceCoordinate?: [number, number]
}

function MapView({
  pointA,
  pointB,
  routeGeometries,
  selectedRouteIndex,
  onMapClick,
  onPointADrag,
  onPointBDrag,
  roads = [],
  places = [],
  layerVisibility,
  mode = 'route',
  draftRoadCoordinates = [],
  draftPlaceCoordinate,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const pointAMarkerRef = useRef<maplibregl.Marker | null>(null)
  const pointBMarkerRef = useRef<maplibregl.Marker | null>(null)
  const isStyleReadyRef = useRef(false)

  const { position } = useGeolocation()

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: ABIDJAN_CENTER,
      zoom: MAP_ZOOM.initial,
      minZoom: MAP_ZOOM.min,
      maxZoom: MAP_ZOOM.max,
      maxBounds: ABIDJAN_BBOX,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      // Route layer
      map.addSource(ROUTE_SOURCE_ID, emptyGeoJsonSource())
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['case', ['get', 'selected'], '#2563eb', '#9ca3af'],
          'line-width': ['case', ['get', 'selected'], 5, 3],
          'line-opacity': ['case', ['get', 'selected'], 0.95, 0.6],
        },
      })

      // Local roads layer
      map.addSource(ROADS_SOURCE_ID, emptyGeoJsonSource())
      map.addLayer({
        id: ROADS_LAYER_ID,
        type: 'line',
        source: ROADS_SOURCE_ID,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'is_blocked'], true], '#7f1d1d',
            ['==', ['get', 'point_controle'], true], '#7c3aed',
            '#6b7280'
          ],
          'line-width': 4,
          'line-opacity': 0.8,
        },
        filter: ['==', ['get', 'visible'], true],
      })

      // Local places layer
      map.addSource(PLACES_SOURCE_ID, emptyGeoJsonSource())
      map.addLayer({
        id: PLACES_LAYER_ID,
        type: 'circle',
        source: PLACES_SOURCE_ID,
        paint: {
          'circle-radius': 8,
          'circle-color': '#0891b2',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
        filter: ['==', ['get', 'visible'], true],
      })

      // Add place labels
      map.addLayer({
        id: `${PLACES_LAYER_ID}-labels`,
        type: 'symbol',
        source: PLACES_SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-offset': [0, -1.5],
          'text-anchor': 'bottom',
        },
        paint: {
          'text-color': '#374151',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
        filter: ['==', ['get', 'visible'], true],
      })

      // Draft points layer (for adding roads/places)
      map.addSource(DRAFT_SOURCE_ID, emptyGeoJsonSource())
      
      // Draft line for road being added
      map.addLayer({
        id: DRAFT_LINE_LAYER_ID,
        type: 'line',
        source: DRAFT_SOURCE_ID,
        filter: ['==', ['get', 'type'], 'line'],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#22c55e',
          'line-width': 4,
          'line-dasharray': [2, 2],
        },
      })

      // Draft points
      map.addLayer({
        id: DRAFT_LAYER_ID,
        type: 'circle',
        source: DRAFT_SOURCE_ID,
        filter: ['==', ['get', 'type'], 'point'],
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'pointType'], 'road'], '#22c55e',
            ['==', ['get', 'pointType'], 'place'], '#06b6d4',
            '#fbbf24'
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      isStyleReadyRef.current = true
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      isStyleReadyRef.current = false
    }
  }, [])

  // Update cursor based on mode
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const canvas = map.getCanvas()
    if (mode === 'add-road' || mode === 'add-place') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = ''
    }
  }, [mode])

  // Update draft points/lines on map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isStyleReadyRef.current) return

    const draftSource = map.getSource(DRAFT_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!draftSource) return

    const features: Array<{
      type: 'Feature'
      properties: Record<string, unknown>
      geometry: {
        type: 'Point' | 'LineString'
        coordinates: number[] | number[][],
      },
    }> = []

    // Add road draft points and line
    if (draftRoadCoordinates.length > 0) {
      // Add points
      draftRoadCoordinates.forEach((coord, index) => {
        features.push({
          type: 'Feature',
          properties: { type: 'point', pointType: 'road', index },
          geometry: { type: 'Point', coordinates: coord },
        })
      })

      // Add connecting line
      if (draftRoadCoordinates.length > 1) {
        features.push({
          type: 'Feature',
          properties: { type: 'line' },
          geometry: { type: 'LineString', coordinates: draftRoadCoordinates },
        })
      }
    }

    // Add place draft point
    if (draftPlaceCoordinate) {
      features.push({
        type: 'Feature',
        properties: { type: 'point', pointType: 'place' },
        geometry: { type: 'Point', coordinates: draftPlaceCoordinate },
      })
    }

    draftSource.setData({
      type: 'FeatureCollection',
      features,
    })
  }, [draftRoadCoordinates, draftPlaceCoordinate])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onClick = (e: maplibregl.MapMouseEvent) => {
      onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    }

    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
    }
  }, [onMapClick])

  const handleUseCurrentLocation = () => {
    const map = mapRef.current
    if (!map || !position) return

    onPointADrag({ lat: position.lat, lng: position.lng })
    map.flyTo({ center: [position.lng, position.lat], zoom: 15, duration: 600 })
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([position.lng, position.lat])
    } else {
      userMarkerRef.current = new maplibregl.Marker({ element: createMarkerElement('#2563eb') })
        .setLngLat([position.lng, position.lat])
        .addTo(map)
    }
  }, [position])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !pointA) return

    if (pointAMarkerRef.current) {
      pointAMarkerRef.current.setLngLat([pointA.lng, pointA.lat])
    } else {
      const marker = new maplibregl.Marker({ element: createMarkerElement('#16a34a'), draggable: true })
        .setLngLat([pointA.lng, pointA.lat])
        .addTo(map)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        onPointADrag({ lat: lngLat.lat, lng: lngLat.lng })
      })

      pointAMarkerRef.current = marker
    }
  }, [pointA, onPointADrag])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !pointB) return

    if (pointBMarkerRef.current) {
      pointBMarkerRef.current.setLngLat([pointB.lng, pointB.lat])
    } else {
      const marker = new maplibregl.Marker({ element: createMarkerElement('#ea580c'), draggable: true })
        .setLngLat([pointB.lng, pointB.lat])
        .addTo(map)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        onPointBDrag({ lat: lngLat.lat, lng: lngLat.lng })
      })

      pointBMarkerRef.current = marker
    }
  }, [pointB, onPointBDrag])

  useEffect(() => {
    if (!pointA && pointAMarkerRef.current) {
      pointAMarkerRef.current.remove()
      pointAMarkerRef.current = null
    }
  }, [pointA])

  useEffect(() => {
    if (!pointB && pointBMarkerRef.current) {
      pointBMarkerRef.current.remove()
      pointBMarkerRef.current = null
    }
  }, [pointB])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const applyRoutes = () => {
      const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      if (!source) return

      if (routeGeometries.length === 0) {
        source.setData({ type: 'FeatureCollection', features: [] })
        return
      }

      source.setData({
        type: 'FeatureCollection',
        features: routeGeometries.map((geometry, index) => ({
          type: 'Feature',
          properties: { selected: index === selectedRouteIndex },
          geometry,
        })),
      })

      const selectedGeometry = routeGeometries[selectedRouteIndex] ?? routeGeometries[0]
      const bounds = selectedGeometry.coordinates.reduce(
        (b: maplibregl.LngLatBounds, coord: [number, number]) => b.extend(coord),
        new maplibregl.LngLatBounds(selectedGeometry.coordinates[0], selectedGeometry.coordinates[0])
      )

      map.fitBounds(bounds, { padding: 60, maxZoom: MAP_ZOOM.max, duration: 500 })
    }

    if (isStyleReadyRef.current) {
      applyRoutes()
    } else {
      map.once('load', applyRoutes)
    }
  }, [routeGeometries, selectedRouteIndex])

  // Phase 2: Update local data layers based on visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isStyleReadyRef.current || !layerVisibility) return

    const roadsSource = map.getSource(ROADS_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    const placesSource = map.getSource(PLACES_SOURCE_ID) as maplibregl.GeoJSONSource | undefined

    if (roadsSource) {
      // Show roads that match ANY of the enabled layer filters
      const visibleRoads = roads.filter((road) => {
        // If no road layers are enabled, don't show any roads
        const anyRoadLayerEnabled = 
          layerVisibility.road_condition ||
          layerVisibility.flood_risk ||
          layerVisibility.blocked_roads ||
          layerVisibility.control_points ||
          layerVisibility.tolls
        
        if (!anyRoadLayerEnabled) return false

        // Show road if it matches at least one enabled layer
        if (layerVisibility.road_condition && road.surface_state) return true
        if (layerVisibility.flood_risk && road.seasonal_practicability) return true
        if (layerVisibility.blocked_roads && road.is_blocked) return true
        if (layerVisibility.control_points && road.point_controle) return true
        
        // If road_condition is enabled but this road has no surface_state, still show it
        // (it will be gray/default color)
        if (layerVisibility.road_condition) return true
        
        return false
      })

      roadsSource.setData({
        type: 'FeatureCollection',
        features: visibleRoads.map((road) => ({
          type: 'Feature',
          properties: {
            ...road,
            visible: true,
          },
          geometry: road.geometry,
        })),
      })
    }

  if (placesSource) {
      const visiblePlaces = layerVisibility.local_places ? places : []

      placesSource.setData({
        type: 'FeatureCollection',
        features: visiblePlaces.map((place) => ({
          type: 'Feature',
          properties: {
            ...place,
            visible: true,
          },
          // Le backend renvoie `location: {lat, lng}` (format plat),
          // pas du GeoJSON — on le convertit ici pour MapLibre.
          geometry: {
            type: 'Point',
            coordinates: [place.location.lng, place.location.lat],
          },
        })),
      })
    }
  }, [roads, places, layerVisibility])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      <button
        onClick={handleUseCurrentLocation}
        disabled={!position}
        title="Utiliser ma position actuelle comme point de départ"
        aria-label="Utiliser ma position actuelle comme point de départ"
        className="absolute top-24 right-2 z-10 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M12 2 L19 21 L12 17 L5 21 Z" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default MapView
