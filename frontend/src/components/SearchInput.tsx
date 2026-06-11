import React, { useState } from 'react'
import { Search, Sparkles, ArrowRight } from 'lucide-react'

interface SearchInputProps {
  onSearch: (topic: string) => void
  isLoading: boolean
}

const EXAMPLE_TOPICS = [
  'Artificial Intelligence', 'Climate Change', 'Quantum Computing',
  'Space Exploration', 'Renewable Energy', 'Blockchain Technology',
  'Human Genome Project', 'The Renaissance', 'Black Holes',
]

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !isLoading) {
      onSearch(topic.trim())
    }
  }

  const handleExample = (example: string) => {
    setTopic(example)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero text */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 mb-4">
          <Sparkles className="w-3 h-3" />
          Powered by CrewAI + Wikipedia
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          Deep Research,{' '}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Automated
          </span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
          Four specialized AI agents collaborate to research any topic, verify facts, and generate a comprehensive report — automatically.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter a research topic, e.g. 'Artificial Intelligence'..."
            className="w-full pl-12 pr-36 py-4 text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white dark:placeholder:text-slate-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white font-semibold text-sm rounded-xl transition-all disabled:cursor-not-allowed shadow-md disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running
              </>
            ) : (
              <>
                Research
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example topics */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-slate-400 dark:text-slate-500 self-center mr-1">Try:</span>
        {EXAMPLE_TOPICS.map(ex => (
          <button
            key={ex}
            onClick={() => handleExample(ex)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
