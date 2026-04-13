'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { buildCatalogHref } from '@/features/catalog/catalog-query'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

function clampInt(n: number, min: number, max: number): number {
  if (n < min) return min
  if (n > max) return max
  return n
}

export function CatalogPagination({
                                    page,
                                    totalPages,
                                    hasPrev,
                                    hasNext,
                                  }: CatalogPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    
    const result: number[] = []
    
    if (start > 1) {
      result.push(1)
      if (start > 2) result.push(-1) // ellipsis
    }
    
    for (let p = start; p <= end; p += 1) {
      result.push(p)
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) result.push(-1)
      result.push(totalPages)
    }
    
    return result
  }, [page, totalPages])
  
  const goToPage = (nextPage: number) => {
    const safePage = clampInt(nextPage, 1, totalPages)
    
    router.push(
      buildCatalogHref({
        pathname,
        searchParams,
        patch: {
          page: safePage <= 1 ? null : String(safePage)
        }
      })
    )
  }

  if (totalPages <= 1) return null
  
  return (
    <nav
      aria-label={'Catalog pagination'}
      className="flex items-center justify-center gap-1 pt-6">
      {/* Prev */}
      <button
        type="button"
        disabled={!hasPrev}
        onClick={() => goToPage(page - 1)}
        className="rounded-md px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-40 hover:bg-zinc-100"
      >
        Prev
      </button>
      
      {/* Pages */}
      {pages.map((p, idx) =>
        p === -1 ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-zinc-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm ${
              p === page
                ? 'bg-zinc-900 text-zinc-50'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {p}
          </button>
        ),
      )}
      
      {/* Next */}
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => goToPage(page + 1)}
        className="rounded-md px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-40 hover:bg-zinc-100"
      >
        Next
      </button>
    </nav>
  )
}