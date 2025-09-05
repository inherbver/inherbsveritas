'use client'

/**
 * Sheet Component - Modal/Drawer slide-in
 * Compatible shadcn/ui API
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Context
interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

// Main Sheet container
interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({ children, open = false, onOpenChange }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

// Trigger
interface SheetTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function SheetTrigger({ asChild, children }: SheetTriggerProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('SheetTrigger must be used within Sheet')

  const handleClick = () => context.onOpenChange(true)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    } as any)
  }

  return <button onClick={handleClick}>{children}</button>
}

// Content
interface SheetContentProps {
  children: React.ReactNode
  className?: string
}

export function SheetContent({ children, className }: SheetContentProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('SheetContent must be used within Sheet')

  if (!context.open) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => context.onOpenChange(false)}
      />
      
      {/* Sheet */}
      <div className={cn(
        "fixed right-0 top-0 z-50 h-full bg-background p-6 shadow-lg",
        "translate-x-0 transition-transform duration-300",
        className
      )}>
        <Button
          variant="outline" 
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => context.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {children}
      </div>
    </>
  )
}

// Header
interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

// Title
interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  )
}

// Description
interface SheetDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}