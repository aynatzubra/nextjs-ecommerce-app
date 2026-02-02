import { z } from 'zod'

export const catalogSortSchema = z.enum(['newest', 'price_asc', 'price_desc'])

const nonEmptyTrimmed = z
  .string()
  .transform((v) => v.trim())
  .transform((v) => (v === '' ? undefined : v))
  .optional()

export const catalogSearchParamsSchema = z
  .object({
    category: nonEmptyTrimmed,
    min: nonEmptyTrimmed,
    max: nonEmptyTrimmed,
    inStock: nonEmptyTrimmed,
    sort: catalogSortSchema.optional(),
    page: nonEmptyTrimmed,
    limit: nonEmptyTrimmed,
  })
  .strict()
