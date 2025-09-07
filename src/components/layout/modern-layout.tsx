'use client'

/**
 * @file ModernLayout - Layout moderne avec nouveau header
 * @description Layout complet avec ModernHeader, gestion espace header fixe
 */

import * as React from "react"
import { ModernHeader } from "@/components/header/modern-header"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"

interface ModernLayoutProps {
  children: React.ReactNode
  locale?: string
  className?: string
}

export function ModernLayout({ children, locale = 'fr', className }: ModernLayoutProps) {
  return (
    <>
      <ModernHeader locale={locale} />
      
      {/* Main content avec espace pour header fixe */}
      <main className={`min-h-screen pt-[140px] ${className || ''}`}>
        {children}
      </main>
      
      <Footer />
      <ScrollToTop />
    </>
  )
}

// Version intégrée pour remplacer directement dans le layout existant
export function ModernLayoutWrapper({ 
  children, 
  locale = 'fr' 
}: { 
  children: React.ReactNode
  locale?: string 
}) {
  return (
    <div className="isolate">
      <ModernHeader locale={locale} />
      
      {/* Contenu principal avec espacement pour header fixe */}
      <div className="pt-[140px]">
        {children}
      </div>
      
      <Footer />
      <ScrollToTop />
    </div>
  )
}