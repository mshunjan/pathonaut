"use client"

import ThemeToggle from "@/components/theme-toggle"
import Logo from "@/components/logo"

export function SiteHeader() {

  return (
    <header className="flex sticky top-0 z-50 w-full items-center px-4 justify-between">
      <Logo full={false} />
      <div className="flex h-[var(--header-height)] items-center gap-2 px-4">
        <ThemeToggle />
  
      </div>
    </header>
  )
}
