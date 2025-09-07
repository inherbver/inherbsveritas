'use client'

/**
 * @file HeaderNavigation - Navigation principale du header
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface HeaderNavigationProps {
  items: NavigationItem[]
  className?: string
}

export function HeaderNavigation({ items, className }: HeaderNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("hidden lg:flex items-center space-x-8", className)} aria-label="Navigation principale">
      {items?.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors duration-200 hover:text-green-600",
            pathname === item.href || pathname.startsWith(item.href)
              ? "text-green-600 font-semibold"
              : "text-gray-700"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}