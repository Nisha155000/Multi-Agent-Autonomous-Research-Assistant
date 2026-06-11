import React from 'react'

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Report header skeleton */}
      <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-40" />
      
      {/* Section skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className={`h-4 bg-slate-200 dark:bg-slate-700 rounded w-${['1/3', '1/4', '2/5'][i - 1]}`} />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-11/12" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
