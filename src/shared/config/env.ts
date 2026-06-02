import 'server-only'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  
  DATABASE_URL: z.string().min(1),
  
  APP_URL: z.string().url(),
  
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  
  AUTH_SECRET: z.string().min(32),
  
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    'Invalid server environment variables:',
    parsed.error.flatten().fieldErrors,
  )
  
  throw new Error('Server environment validation failed')
}

export const env = parsed.data