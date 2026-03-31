import { JWT } from 'next-auth/jwt'
import { Session, User } from 'next-auth'

type JwtCallbackParams = {
  token: JWT
  user?: User
}

export async function jwtCallback({ token, user }: JwtCallbackParams): Promise<JWT> {
  if (user) {
    token.id = user.id
    token.role = (user as any).role
  }
  return token
}

type SessionCallbackParams = {
  session: Session
  token: JWT
}

export async function sessionCallback({ session, token }: SessionCallbackParams): Promise<Session> {
  if (session.user) {
    session.user.id = token.id as string
    session.user.role = token.role as 'ADMIN' | 'USER'
  }
  return session
}
