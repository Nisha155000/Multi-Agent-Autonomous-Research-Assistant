import React from 'react'
import { CheckCircle, Circle, Loader, AlertCircle, Search, BarChart2, ShieldCheck, FileText } from 'lucide-react'
import { AgentLog } from '../utils/api'

interface AgentPanelProps {
  currentAgent: string | null
  progress: number
  status: string
  logs: AgentLog[]
}

const AGENTS = [
  {
    name: 'Research Agent',
    role: 'Senior Research Analyst',
    description: 'Searching Wikipedia, extracting key facts and entities',
    icon: Search,
    color: 'blue',
    progressRange: [0, 0.35],
  },
  {
    name: 'Analysis Agent',
    role: 'Expert Data Analyst',
    description: 'Identifying trends, patterns, and key insights',
    icon: BarChart2,
    color: 'violet',
    progressRange: [0.35, 0.60],
  },
  {
    name: 'Fact Verification Agent',
    role: 'Fact Verification Specialist',
    description: 'Verifying consistency and assigning confidence scores',
    icon: ShieldCheck,
    color: 'emerald',
    progressRange: [0.60, 0.80],
  },
  {
    name: 'Report Writer Agent',
    role: 'Professional Report Writer',
    description: 'Composing the comprehensive research report',
    icon: FileText,
    color: 'amber',
    progressRange: [0.80, 1.0],
  },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
}

const activeRingMap: Record<string, string> = {
  blue: 'ring-2 ring-blue-400 dark:ring-blue-500',
  violet: 'ring-2 ring-violet-400 dark:ring-violet-500',
  emerald: 'ring-2 ring-emerald-400 dark:ring-emerald-500',
  amber: 'ring-2 ring-amber-400 dark:ring-amber-500',
}

function getAgentState(agent: typeof AGENTS[0], progress: number, status: string) {
  const [min, max] = agent.progressRange
  if (status === 'completed') return 'done'
  if (progress >= max) return 'done'
  if (progress >= min && progress < max) return 'active'
  return 'waiting'
}

export default function AgentPanel({ currentAgent, progress, status, logs }: AgentPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Agent Activity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time agent collaboration</p>
        </div>
        {status === 'running' && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Overall Progress</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${Math.round(progress * 100)}%` }}
          >
            {status === 'running' && (
              <div className="absolute inset-0 shimmer" />
            )}
          </div>
        </div>
      </div>

      {/* Agents */}
      <div className="p-5 space-y-3">
        {AGENTS.map((agent) => {
          const agentStatus = getAgentState(agent, progress, status)
          const Icon = agent.icon
          const isActive = agentStatus === 'active'
          const isDone = agentStatus === 'done'

          return (
            <div
              key={agent.name}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300
                ${isDone ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 opacity-75' : ''}
                ${isActive ? `bg-${agent.color}-50 dark:bg-${agent.color}-900/10 border-${agent.color}-200 dark:border-${agent.color}-800/50` : ''}
                ${agentStatus === 'waiting' ? 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-50' : ''}
              `}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorMap[agent.color]} ${isActive ? activeRingMap[agent.color] : ''}`}>
                {isActive ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {agent.name}
                  </p>
                  <div className="flex-shrink-0">
                    {isDone && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                    {agentStatus === 'waiting' && <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{agent.role}</p>
                {isActive && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium animate-pulse">
                    {agent.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="px-5 pb-5">
          <div className="bg-slate-950 rounded-xl p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wide">System Logs</p>
            <div className="space-y-1">
              {logs.slice(-20).map((log, i) => (
                <div key={i} className="flex gap-2 text-xs font-mono">
                  <span className="text-slate-600 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-emerald-400 flex-shrink-0">[{log.agent.split(' ')[0]}]</span>
                  <span className="text-slate-300 break-all">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
