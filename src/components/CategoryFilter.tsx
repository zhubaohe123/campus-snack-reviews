'use client'

import { categoryConfig } from '@/lib/mock-data'

interface CategoryFilterProps {
  selected: string
  onChange: (category: string) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {categoryConfig.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === cat.key
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.key}</span>
        </button>
      ))}
    </div>
  )
}
