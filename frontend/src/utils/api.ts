import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export interface StartResearchResponse {
  session_id: string
  topic: string
  status: string
  message: string
}

export interface AgentLog {
  agent: string
  action: string
  details: string
  timestamp: string
  status: string
}

export interface ResearchStatus {
  session_id: string
  topic: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  current_agent: string | null
  created_at: string
  completed_at: string | null
  error?: string
  agent_logs: AgentLog[]
}

export interface ResearchReport {
  session_id: string
  topic: string
  executive_summary: string
  introduction: string
  background: string
  key_findings: string
  detailed_analysis: string
  verified_facts: string
  conclusion: string
  references: string
  full_report: string
  created_at: string
  has_pdf: boolean
}

export interface HistorySession {
  session_id: string
  topic: string
  status: string
  progress: number
  created_at: string
  completed_at: string | null
}

export const startResearch = async (topic: string): Promise<StartResearchResponse> => {
  const response = await api.post('/api/research/start', { topic })
  return response.data
}

export const getResearchStatus = async (sessionId: string): Promise<ResearchStatus> => {
  const response = await api.get(`/api/research/status/${sessionId}`)
  return response.data
}

export const getResearchReport = async (sessionId: string): Promise<ResearchReport> => {
  const response = await api.get(`/api/research/report/${sessionId}`)
  return response.data
}

export const getResearchHistory = async (skip = 0, limit = 20): Promise<{ total: number; sessions: HistorySession[] }> => {
  const response = await api.get('/api/research/history', { params: { skip, limit } })
  return response.data
}

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/api/research/${sessionId}`)
}

export const getDownloadUrl = (sessionId: string): string => {
  return `${API_BASE}/api/research/download/${sessionId}`
}

export default api
