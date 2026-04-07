'use client'

import { signOut } from 'next-auth/react'

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function LogoutButton({ onClick, ...props }: LogoutButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)

    if (!e.isDefaultPrevented()) {
      signOut({ callbackUrl: '/' })
    }
  }

  return (
    <button {...props} type="button" onClick={handleClick}>
      Logout
    </button>
  )
}
