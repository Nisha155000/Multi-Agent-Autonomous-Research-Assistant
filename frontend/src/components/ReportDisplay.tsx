import React, { useState } from 'react'
import { FileText, Download, ChevronDown, ChevronUp, CheckCircle, BookOpen, BarChart2, Shield, Lightbulb, FileSearch, Quote, Link } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ResearchReport, getDownloadUrl } from '../utils/api'

interface ReportDisplayProps {
  report: ResearchReport
}

const SECTIONS = [
  { key: 'executive_summary', title: 'Executive Summary', icon: Lightbulb, color: 'blue' },
  { key: 'introduction', title: 'Introduction', icon: BookOpen, color: 'indigo' },
  { key: 'background', title: 'Background Information', icon: FileSearch, color: 'violet' },
  { key: 'key_findings', title: 'Key Findings', icon: CheckCircle, color: 'emerald' },
  { key: 'detailed_analysis', title: 'Detailed Analysis', icon: BarChart2, color: 'blue' },
  { key: 'verified_facts', title: 'Verified Facts', icon: Shield, color: 'amber' },
  { key: 'conclusion', title: 'Conclusion', icon: FileText, color: 'indigo' },
  { key: 'references', title: 'References', icon: Link, color: 'slate' },
]

const colorConfig: Record<string, { bg: string; border: string; icon: string; num: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
    num: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-500 dark:text-indigo-400',
    num: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'text-violet-500 dark:text-violet-400',
    num: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-500 dark:text-emerald-400',
    num: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400',
    num: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    icon: 'text-slate-500 dark:text-slate-400',
    num: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  },
}

function SectionCard({
  section,
  content,
  index,
  defaultOpen = false,
}: {
  section: typeof SECTIONS[0]
  content: string
  index: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = section.icon
  const c = colorConfig[section.color]

  if (!content?.trim()) return null

  return (
    <div className={`rounded-2xl border ${c.border} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 ${c.bg} hover:brightness-95 dark:hover:brightness-110 transition-all text-left`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.num}`}>
            {String(index).padStart(2, '0')}
          </span>
          <Icon className={`w-4 h-4 ${c.icon}`} />
          <span className="font-semibold text-slate-900 dark:text-white text-sm">{section.title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />
        }
      </button>
      {open && (
        <div className="px-5 py-5 bg-white dark:bg-slate-800 animate-fade-in">
          <div className="markdown-content prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  const wordCount = Object.values(report).reduce((acc, val) => {
    if (typeof val === 'string') return acc + val.split(/\s+/).length
    return acc
  }, 0)

  const sectionsWithContent = SECTIONS.filter(s => {
    const content = report[s.key as keyof ResearchReport] as string
    return content?.trim()
  })

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Report header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Research Complete</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 leading-tight">
              {report.topic}
            </h2>
            <p className="text-slate-400 text-sm">
              Generated {new Date(report.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <a
            href={getDownloadUrl(report.session_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium text-white transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{sectionsWithContent.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Sections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-xs text-slate-400 mt-0.5">Agents Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{(wordCount / 1000).toFixed(1)}k</p>
            <p className="text-xs text-slate-400 mt-0.5">Words</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, i) => {
          const content = report[section.key as keyof ResearchReport] as string
          return (
            <SectionCard
              key={section.key}
              section={section}
              content={content}
              index={i + 1}
              defaultOpen={i === 0}
            />
          )
        })}
      </div>
    </div>
  )
}
