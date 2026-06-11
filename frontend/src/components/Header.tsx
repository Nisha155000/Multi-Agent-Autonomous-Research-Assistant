import React from 'react'
import { Brain, Moon, Sun, BookOpen } from 'lucide-react'

interface HeaderProps {
  isDark: boolean
  toggleDark: () => void
  onHistoryClick: () => void
}

export default function Header({ isDark, toggleDark, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Research Assistant
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                Multi-Agent AI System
              </p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={onHistoryClick}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Agent status badges */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              {['Research', 'Analysis', 'Verify', 'Write'].map((label, i) => (
                <div
                  key={label}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 dark:text-slate-400 font-medium"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
