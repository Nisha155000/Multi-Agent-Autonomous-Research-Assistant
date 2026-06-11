import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, X } from 'lucide-react'

import Header from './components/Header'
import SearchInput from './components/SearchInput'
import AgentPanel from './components/AgentPanel'
import ReportDisplay from './components/ReportDisplay'
import HistoryPanel from './components/HistoryPanel'
import LoadingSkeleton from './components/LoadingSkeleton'

import { useDarkMode } from './hooks/useDarkMode'
import {
  startResearch,
  getResearchStatus,
  getResearchReport,
  ResearchStatus,
  ResearchReport,
} from './utils/api'

type AppState = 'idle' | 'researching' | 'done' | 'error'

interface Toast {
  id: number
  type: 'error' | 'success' | 'info'
  message: string
}

export default function App() {
  const { isDark, toggleDark } = useDarkMode()
  const [appState, setAppState] = useState<AppState>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [researchStatus, setResearchStatus] = useState<ResearchStatus | null>(null)
  const [report, setReport] = useState<ResearchReport | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loadingReport, setLoadingReport] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastIdRef = useRef(0)

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const fetchReport = useCallback(async (sid: string) => {
    try {
      setLoadingReport(true)
      const r = await getResearchReport(sid)
      setReport(r)
      setAppState('done')
    } catch (e: any) {
      addToast('error', 'Failed to load report. Please try again.')
      setAppState('error')
    } finally {
      setLoadingReport(false)
    }
  }, [addToast])

  const startPolling = useCallback((sid: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const status = await getResearchStatus(sid)
        setResearchStatus(status)

        if (status.status === 'completed') {
          stopPolling()
          await fetchReport(sid)
        } else if (status.status === 'failed') {
          stopPolling()
          setAppState('error')
          addToast('error', status.error || 'Research failed. Please check your API key and try again.')
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 2000)
  }, [stopPolling, fetchReport, addToast])

  const handleSearch = async (topic: string) => {
    try {
      setAppState('researching')
      setReport(null)
      setResearchStatus(null)

      const response = await startResearch(topic)
      setSessionId(response.session_id)
      startPolling(response.session_id)
      addToast('info', `Research started for "${topic}"`)
    } catch (e: any) {
      setAppState('error')
      addToast('error', 'Failed to start research. Is the backend running?')
    }
  }

  const handleSelectFromHistory = async (sid: string, topic: string) => {
    stopPolling()
    setSessionId(sid)
    setReport(null)
    setResearchStatus(null)
    setAppState('researching')
    setLoadingReport(true)
    await fetchReport(sid)
  }

  const handleNewSearch = () => {
    stopPolling()
    setAppState('idle')
    setReport(null)
    setResearchStatus(null)
    setSessionId(null)
  }

  useEffect(() => () => stopPolling(), [stopPolling])

  const isResearching = appState === 'researching'
  const isDone = appState === 'done'
  const showAgentPanel = isResearching && researchStatus

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header
        isDark={isDark}
        toggleDark={toggleDark}
        onHistoryClick={() => setShowHistory(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search input - always visible unless done */}
        {!isDone && (
          <div className="mb-10">
            <SearchInput onSearch={handleSearch} isLoading={isResearching} />
          </div>
        )}

        {/* New search button when done */}
        {isDone && (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Research Report</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {report?.topic}
              </p>
            </div>
            <button
              onClick={handleNewSearch}
              className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-sm"
            >
              + New Research
            </button>
          </div>
        )}

        {/* Content area */}
        <div className={`${showAgentPanel || (isDone && report) ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}`}>
          {/* Left: Agent panel (while researching) */}
          {showAgentPanel && (
            <div className="lg:col-span-1">
              <AgentPanel
                currentAgent={researchStatus.current_agent}
                progress={researchStatus.progress}
                status={researchStatus.status}
                logs={researchStatus.agent_logs}
              />
            </div>
          )}

          {/* Center/Right: Loading or Report */}
          <div className={showAgentPanel ? 'lg:col-span-2' : 'col-span-full'}>
            {isResearching && !showAgentPanel && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Initializing research agents...</p>
              </div>
            )}

            {isResearching && showAgentPanel && loadingReport && (
              <LoadingSkeleton />
            )}

            {isResearching && showAgentPanel && !loadingReport && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Agents are working...
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                  {researchStatus?.current_agent
                    ? `${researchStatus.current_agent} is processing your research`
                    : 'Research agents are collaborating on your topic'
                  }
                </p>
                <div className="mt-4 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((researchStatus?.progress || 0) * 100)}%
                </div>
              </div>
            )}

            {isDone && loadingReport && <LoadingSkeleton />}

            {isDone && report && !loadingReport && (
              <ReportDisplay report={report} />
            )}

            {appState === 'error' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Research Failed</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm mb-4">
                  The research could not be completed. Please ensure your OpenAI API key is set in the backend .env file.
                </p>
                <button
                  onClick={handleNewSearch}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Idle: How it works */}
        {appState === 'idle' && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Research Agent', desc: 'Searches Wikipedia and extracts facts, dates, and key entities', color: 'blue' },
              { num: '02', title: 'Analysis Agent', desc: 'Identifies trends, patterns, and synthesizes key insights', color: 'violet' },
              { num: '03', title: 'Verification Agent', desc: 'Fact-checks findings and assigns confidence scores', color: 'emerald' },
              { num: '04', title: 'Writer Agent', desc: 'Composes the final professional research report', color: 'amber' },
            ].map(step => (
              <div
                key={step.num}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className={`text-xs font-bold text-${step.color}-600 dark:text-${step.color}-400 mb-2`}>
                  {step.num}
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onSelectSession={handleSelectFromHistory}
        />
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-slide-up max-w-sm
              ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
              ${toast.type === 'success' ? 'bg-emerald-600 text-white' : ''}
              ${toast.type === 'info' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : ''}
            `}
          >
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
