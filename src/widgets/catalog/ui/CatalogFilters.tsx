'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { buildCatalogHref } from '@/features/catalog/catalog-query'
import { CatalogQuery } from '@/entities/product'
import { LIMIT_OPTIONS, Option, SORT_OPTIONS } from '@/entities/product/model/catalog.types'

interface CatalogFiltersProps {
  categories: Option[]
  query: CatalogQuery
}

export function CatalogFilters({
                                 categories,
                                 query,
                               }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [min, setMin] = useState(query.minPrice?.toString() ?? '')
  const [max, setMax] = useState(query.maxPrice?.toString() ?? '')
  
  useEffect(() => {
    setMin(query.minPrice?.toString() ?? '')
    setMax(query.maxPrice?.toString() ?? '')
  }, [query.minPrice, query.maxPrice])
  
  const pushParams = (patch: Record<string, string | null>) => {
    router.push(
      buildCatalogHref({
        pathname,
        searchParams,
        patch,
        resetPage: true,
      }),
    )
  }
  
  const applyPrice = () => {
    pushParams({
      min: min?.trim() ? min.trim() : null,
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
            value={query.categorySlug ?? ''}
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
            value={query.sort}
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
            value={String(query.limit)}
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
            checked={query.inStock === true}
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
