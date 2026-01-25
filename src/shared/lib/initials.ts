export function initials(nameOrEmail?: string | null) {
  const s = (nameOrEmail ?? '').trim()
  if (!s) return '?'

  const base = s.includes('@') ? s.split('@')[0] : s
  const parts = base.split(/\s+/).filter(Boolean)

  const a = parts[0]?.[0] ?? '?'
  const b = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1]

  return (a + (b ?? '')).toUpperCase()
}
