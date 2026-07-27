export interface HealthStatus {
  status: string
  service: string
  routing_engine?: string
  database?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function fetchHealthEndpoint(path: string): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  const body = (await response.json()) as HealthStatus
  if (!response.ok) {
    throw new Error(`${path} a répondu ${response.status}`)
  }
  return body
}

export async function fetchHealth(): Promise<HealthStatus> {
  return fetchHealthEndpoint('/api/v1/health')
}

export async function fetchDbHealth(): Promise<HealthStatus> {
  return fetchHealthEndpoint('/api/v1/db-health')
}