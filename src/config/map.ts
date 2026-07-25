// Configuration de la carte (bbox Abidjan, zoom, style de tuiles)

// Centre approximatif d'Abidjan
export const ABIDJAN_CENTER: [number, number] = [-4.0267, 5.3364] // [lng, lat]

// Bounding box d'Abidjan (sud-ouest, nord-est) — couvre Plateau, Cocody,
// Marcory, Treichville, Yopougon, Koumassi, Adjamé, Abobo, Port-Bouët, Bingerville
export const ABIDJAN_BBOX: [[number, number], [number, number]] = [
  [-4.15, 5.20], // sud-ouest [lng, lat]
  [-3.85, 5.45], // nord-est [lng, lat]
]

export const MAP_ZOOM = {
  initial: 12,
  min: 10,
  max: 18,
}

// Style de tuiles OSM standard (raster), gratuit, sans clé API
export const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
}