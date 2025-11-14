import { prisma } from '@/lib/prisma'

export async function jwtCallback({ token, user }: any) {
  if (user) {
    token.id = user.id
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    token.role = dbUser?.role || 'USER'
  }
  return token
}

export async function sessionCallback({ session, token }: any) {
  if (token.id) {
    session.user.id = token.id as string
  }
  if (token.role) {
    session.user.role = token.role as 'ADMIN' | 'USER'
  }
  return session
}
