import type { RouteReportCreate, RouteReportRead } from '../types/localData'

function simulateDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Stockage en mémoire — perdu au rechargement, purement pour débloquer le développement
let mockReports: RouteReportRead[] = []
let nextId = 1

export async function fetchRouteReportsMock(status?: string): Promise<RouteReportRead[]> {
  await simulateDelay()
  if (!status) return mockReports
  return mockReports.filter((r) => r.validation_status === status)
}

export async function createRouteReportMock(report: RouteReportCreate): Promise<RouteReportRead> {
  await simulateDelay()
  const now = new Date().toISOString()
  const newReport: RouteReportRead = {
    ...report,
    id: nextId++,
    reported_by: 'mock_user',
    validation_status: 'proposed',
    reported_at: now,
    created_at: now,
    updated_at: now,
  }
  mockReports.push(newReport)
  return newReport
}

export async function validateRouteReportMock(id: number): Promise<RouteReportRead> {
  await simulateDelay()
  const report = mockReports.find((r) => r.id === id)
  if (!report) throw new Error('Signalement introuvable (mock)')
  report.validation_status = 'validated'
  report.updated_at = new Date().toISOString()
  return report
}

export async function rejectRouteReportMock(id: number): Promise<RouteReportRead> {
  await simulateDelay()
  const report = mockReports.find((r) => r.id === id)
  if (!report) throw new Error('Signalement introuvable (mock)')
  report.validation_status = 'rejected'
  report.updated_at = new Date().toISOString()
  return report
}