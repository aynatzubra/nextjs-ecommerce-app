'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Option = { value: string; label: string }

const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
]

const LIMIT_OPTIONS: Option[] = [
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
]

export function CatalogFilters({ categories }: { categories: Option[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const current = useMemo(() => {
    const get = (key: string) => searchParams.get(key) ?? ''
    return {
      category: get('category'),
      min: get('min'),
      max: get('max'),
      inStock: get('inStock'), // "1"
      sort: get('sort') || 'newest',
      limit: get('limit') || '12',
    }
  }, [searchParams])
  
  const [min, setMin] = useState(current.min)
  const [max, setMax] = useState(current.max)
  
  useEffect(() => {
    setMin(current.min)
    setMax(current.max)
  }, [current.min, current.max])
  
  // always reset page
  const pushParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString())
    
    next.delete('page')
    
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }
  
  const applyPrice = () => {
    pushParams({
      min: min.trim() ? min.trim() : null,
      max: max.trim() ? max.trim() : null,
    })
  }
  
  const clearAll = () => {
    setMin('')
    setMax('')
    router.push(pathname)
  }
  
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-6">
        {/* Category */}
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Category</span>
          <select
            value={current.category}
            onChange={(e) => pushParams({ category: e.target.value || null })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          >
            <option value="">All</option>
            {categories?.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        
        {/* Sort */}
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Sort</span>
          <select
            value={current.sort}
            onChange={(e) => pushParams({ sort: e.target.value || null })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        
        {/* Limit */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700">Per page</span>
          <select
            value={current.limit}
            onChange={(e) => pushParams({ limit: e.target.value || null })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          >
            {LIMIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        
        {/* In stock */}
        <label className="flex items-end gap-2">
          <input
            type="checkbox"
            checked={current.inStock === '1' || current.inStock === 'true'}
            onChange={(e) => pushParams({ inStock: e.target.checked ? '1' : null })}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700">In stock</span>
        </label>
      </div>
      
      {/* Price range */}
      <div className="mt-4 grid gap-3 md:grid-cols-6">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Min price</span>
          <input
            inputMode="decimal"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="e.g. 100"
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          />
        </label>
        
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Max price</span>
          <input
            inputMode="decimal"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="e.g. 300"
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          />
        </label>
        
        <div className="flex items-end gap-2 md:col-span-2">
          <button
            type="button"
            onClick={applyPrice}
            className="h-9 flex-1 rounded-md bg-zinc-900 px-3 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
