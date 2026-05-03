'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  large?: boolean
}

export function SearchBar({
  placeholder = '搜索商户、菜品...',
  large = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/merchants?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        large
          ? 'bg-white rounded-2xl shadow-lg p-2 border border-gray-100'
          : 'bg-gray-50 rounded-xl p-1.5'
      }`}
    >
      <span className={`pl-3 ${large ? 'text-xl' : 'text-base'}`}>🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 ${
          large ? 'py-2 text-base' : 'py-1.5 text-sm'
        }`}
      />
      <button
        onClick={handleSearch}
        className={`${
          large ? 'btn-primary py-2.5 px-6' : 'btn-primary py-1.5 px-4 text-sm'
        }`}
      >
        搜索
      </button>
    </div>
  )
}
