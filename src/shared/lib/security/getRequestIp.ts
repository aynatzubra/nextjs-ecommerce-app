import { headers } from 'next/headers'

export async function getRequestIp() {
  const h = await headers()
  
  const forwarded = h.get('x-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? null
  }
  
  const realIp = h.get('x-real-ip')
  
  if (realIp) {
    return realIp
  }
  
  return null
}