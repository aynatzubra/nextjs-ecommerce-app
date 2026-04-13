import { ReadonlyURLSearchParams } from 'next/navigation'

type CatalogQueryPatch = Record<string, string | null | undefined>

type BuildCatalogHrefOptions = {
  pathname: string
  searchParams: ReadonlyURLSearchParams
  patch: CatalogQueryPatch
  resetPage?: boolean
}

function toPositiveInt(value: string | null): number | null {
  if (!value) return null
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

export function buildCatalogHref({
                                   pathname,
                                   searchParams,
                                   patch,
                                   resetPage = false,
                                 }: BuildCatalogHrefOptions): string {
  const next = new URLSearchParams(searchParams.toString())
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
  }
  if (resetPage) {
    next.delete('page')
  } else {
    const page = toPositiveInt(next.get('page'))
    if (page == null || page <= 1) {
      next.delete('page')
    }
  }
  const query = next.toString()
  return query ? `${pathname}?${query}` : pathname
}