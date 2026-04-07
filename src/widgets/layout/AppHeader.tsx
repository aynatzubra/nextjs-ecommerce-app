'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { initials } from '@/shared/lib/initials'
import { useClickOutside } from '@/shared/lib/hooks/useClickOutside'
import { LogoutButton } from '@/features/auth'

const navLinksBase = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/cart', label: 'Cart' },
]

const GUEST_ACCOUNT_LABEL = 'Login'

export function AppHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  const isAuthed = !!session?.user
  
  const accountLink = isAuthed ? { href: '/account', label: 'Account' } : { href: '/login', label: GUEST_ACCOUNT_LABEL }
  
  const navLinks = [...navLinksBase, accountLink]
  
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  useEffect(() => {
    setDropdownOpen(false)
  }, [pathname])
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false))
  
  //todo:move dropdown into a separate component
  //todo:escape key handler into a separate hook
  
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
  
  const showAuthUi = status !== 'loading'
  
  const email = session?.user?.email ?? null
  const chipText = initials(session?.user?.name ?? session?.user?.email)
  
  return (
    <header className="h-[70px] bg-black/90 backdrop-blur drop-shadow-md drop-shadow-[#ed68a3]">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-semibold tracking-tight brand-text">
          Bad Rabbit
        </Link>
        
        <nav className="flex gap-2 text-lg">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  'px-3 py-1 transition-colors ' +
                  (isActive ? 'brand-text font-semibold' : 'text-white hover:text-[var(--brand)]')
                }
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        {showAuthUi && isAuthed ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className="grid h-9 w-9 place-items-center rounded-full brand-bg text-black font-semibold hover:opacity-90"
              title={email ?? 'Account'}
            >
              {chipText}
            </button>
            
            {/* DROPDOWN MENU */}
            {dropdownOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-black/95 p-2 text-white shadow-lg"
              >
                <div className="flex items-center gap-3 px-2 py-2">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand)] text-black font-semibold">
                    {chipText}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white/60">Signed in as</div>
                    <div className="truncate text-sm">{email ?? '—'}</div>
                  </div>
                </div>
                
                <div className="my-2 h-px bg-white/10" />
                
                <div className="flex flex-col gap-1">
                  <Link href="/account" role="menuitem" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
                    Account
                  </Link>
                  
                  <LogoutButton
                    role="menuitem"
                    className="rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}
