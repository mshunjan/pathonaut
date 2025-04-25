"use client"

import { SidebarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import Logo from "@/components/logo"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex sticky top-0 z-50 w-full items-center px-4 justify-between border-b">
      <Logo full={false} />
      <div className="flex h-[var(--header-height)] items-center gap-2 px-4">
        <ThemeToggle />
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
      </div>
    </header>
  )
}
