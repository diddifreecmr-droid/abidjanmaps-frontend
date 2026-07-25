import type { FinishJourneyResponse, FinishJourneySummary, JourneyPosition, StartJourneyResponse } from '../types/journey'

function simulateDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mocks des 3 endpoints prévus au PRD (POST /journeys/start, /journeys/{id}/positions,
 * /journeys/{id}/finish). À remplacer par de vrais appels réseau une fois que le
 * backend les aura construits — même approche que routeApi.mock.ts au départ.
 */
export async function startJourneyMock(start: { lat: number; lng: number }): Promise<StartJourneyResponse> {
  await simulateDelay()
  console.log('[MOCK] startJourney — point de départ :', start)
  return { journey_id: `mock_${Date.now()}` }
}

export async function sendPositionMock(journeyId: string, position: JourneyPosition): Promise<void> {
  await simulateDelay(100)
  console.log('[MOCK] sendPosition —', journeyId, position)
}

export async function finishJourneyMock(
  journeyId: string,
  summary: FinishJourneySummary
): Promise<FinishJourneyResponse> {
  await simulateDelay()
  console.log('[MOCK] finishJourney —', journeyId, summary)
  return { journey_id: journeyId, ...summary }
}