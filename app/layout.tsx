/**
 * Root Layout - HerbisVeritas V2 MVP
 * 
 * Layout racine pour toutes les pages de l'application
 * Inclut les providers, styles globaux et métadonnées
 */

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HerbisVeritas V2 - Cosmétiques Naturels Bio',
  description: 'E-commerce de cosmétiques artisanaux biologiques et naturels',
  keywords: 'cosmétiques bio, naturel, artisanal, herbisveritas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        {/* Container principal avec middleware auth */}
        <div id="root" className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}