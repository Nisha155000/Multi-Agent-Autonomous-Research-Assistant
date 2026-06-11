import React, { useEffect, useState } from 'react'
import { X, Clock, CheckCircle, XCircle, Loader, ChevronRight, Trash2, Search } from 'lucide-react'
import { getResearchHistory, deleteSession, HistorySession } from '../utils/api'

interface HistoryPanelProps {
  onClose: () => void
  onSelectSession: (sessionId: string, topic: string) => void
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Completed' },
  running: { icon: Loader, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Running' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Failed' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pending' },
}

export default function HistoryPanel({ onClose, onSelectSession }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<HistorySession[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getResearchHistory(0, 50)
      setSessions(data.sessions)
      setTotal(data.total)
    } catch (e) {
      console.error('Failed to fetch history', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (!confirm('Delete this research session?')) return
    try {
      await deleteSession(sessionId)
      setSessions(s => s.filter(x => x.session_id !== sessionId))
    } catch (e) {
      console.error('Delete failed', e)
    }
  }

  const filtered = sessions.filter(s =>
    s.topic.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Research History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{total} sessions total</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">{search ? 'No results found' : 'No research history yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map(session => {
                const cfg = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.pending
                const StatusIcon = cfg.icon
                return (
                  <div
                    key={session.session_id}
                    onClick={() => {
                      if (session.status === 'completed') {
                        onSelectSession(session.session_id, session.topic)
                        onClose()
                      }
                    }}
                    className={`group flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${session.status === 'completed' ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${cfg.color} ${session.status === 'running' ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session.topic}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs ${cfg.color} font-medium`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => handleDelete(e, session.session_id)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {session.status === 'completed' && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
