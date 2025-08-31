'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher, SimpleThemeToggle } from '@/components/theme/theme-switcher'

// Demo component pour showcase du design system HerbisVeritas
export function ColorShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header avec theme switcher */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-hv-primary">Design System HerbisVeritas</h1>
          <p className="text-hv-neutral-600 mt-2">Couleurs, composants et tokens CSS variables</p>
        </div>
        <div className="flex gap-4">
          <SimpleThemeToggle />
          <ThemeSwitcher />
        </div>
      </div>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🌱 Couleurs de Marque</CardTitle>
          <CardDescription>Palette HerbisVeritas - Olivier, Lavande, Soleil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Primary - Vert Olivier */}
            <div className="space-y-3">
              <h3 className="font-semibold text-hv-primary">🌱 Primary - Vert Olivier</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-hv-primary-50 p-3 rounded text-center text-xs">50</div>
                <div className="bg-hv-primary-100 p-3 rounded text-center text-xs">100</div>
                <div className="bg-hv-primary-200 p-3 rounded text-center text-xs">200</div>
                <div className="bg-hv-primary-300 p-3 rounded text-center text-xs">300</div>
                <div className="bg-hv-primary-400 p-3 rounded text-center text-xs text-white">400</div>
                <div className="bg-hv-primary-500 p-3 rounded text-center text-xs font-bold text-white">500 DEFAULT</div>
                <div className="bg-hv-primary-600 p-3 rounded text-center text-xs text-white">600</div>
                <div className="bg-hv-primary-700 p-3 rounded text-center text-xs text-white">700</div>
                <div className="bg-hv-primary-800 p-3 rounded text-center text-xs text-white">800</div>
                <div className="bg-hv-primary-900 p-3 rounded text-center text-xs text-white">900</div>
              </div>
            </div>

            {/* Secondary - Lavande */}
            <div className="space-y-3">
              <h3 className="font-semibold text-hv-secondary">🌸 Secondary - Lavande</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-hv-secondary-50 p-3 rounded text-center text-xs">50</div>
                <div className="bg-hv-secondary-100 p-3 rounded text-center text-xs">100</div>
                <div className="bg-hv-secondary-200 p-3 rounded text-center text-xs">200</div>
                <div className="bg-hv-secondary-300 p-3 rounded text-center text-xs">300</div>
                <div className="bg-hv-secondary-400 p-3 rounded text-center text-xs text-white">400</div>
                <div className="bg-hv-secondary-500 p-3 rounded text-center text-xs font-bold text-white">500 DEFAULT</div>
                <div className="bg-hv-secondary-600 p-3 rounded text-center text-xs text-white">600</div>
                <div className="bg-hv-secondary-700 p-3 rounded text-center text-xs text-white">700</div>
                <div className="bg-hv-secondary-800 p-3 rounded text-center text-xs text-white">800</div>
                <div className="bg-hv-secondary-900 p-3 rounded text-center text-xs text-white">900</div>
              </div>
            </div>

            {/* Accent - Soleil */}
            <div className="space-y-3">
              <h3 className="font-semibold text-hv-accent">☀️ Accent - Soleil</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-hv-accent-50 p-3 rounded text-center text-xs">50</div>
                <div className="bg-hv-accent-100 p-3 rounded text-center text-xs">100</div>
                <div className="bg-hv-accent-200 p-3 rounded text-center text-xs">200</div>
                <div className="bg-hv-accent-300 p-3 rounded text-center text-xs">300</div>
                <div className="bg-hv-accent-400 p-3 rounded text-center text-xs text-white">400</div>
                <div className="bg-hv-accent-500 p-3 rounded text-center text-xs font-bold text-white">500 DEFAULT</div>
                <div className="bg-hv-accent-600 p-3 rounded text-center text-xs text-white">600</div>
                <div className="bg-hv-accent-700 p-3 rounded text-center text-xs text-white">700</div>
                <div className="bg-hv-accent-800 p-3 rounded text-center text-xs text-white">800</div>
                <div className="bg-hv-accent-900 p-3 rounded text-center text-xs text-white">900</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🌞 Couleurs Sémantiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-hv-success p-4 rounded-lg text-white text-center font-medium">
              Success
            </div>
            <div className="bg-hv-warning p-4 rounded-lg text-hv-neutral-900 text-center font-medium">
              Warning
            </div>
            <div className="bg-hv-error p-4 rounded-lg text-white text-center font-medium">
              Error
            </div>
            <div className="bg-hv-info p-4 rounded-lg text-white text-center font-medium">
              Info
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🔘 Variantes de Boutons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Solid buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Solid Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default (shadcn)</Button>
                <Button variant="hv-primary">Primary</Button>
                <Button variant="hv-secondary">Secondary</Button>
                <Button variant="hv-accent">Accent</Button>
              </div>
            </div>

            {/* Outline buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Outline Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">Standard Outline</Button>
                <Button variant="hv-primary-outline">Primary Outline</Button>
                <Button variant="hv-secondary-outline">Secondary Outline</Button>
                <Button variant="hv-accent-outline">Accent Outline</Button>
              </div>
            </div>

            {/* Ghost buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Ghost Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost">Standard Ghost</Button>
                <Button variant="hv-primary-ghost">Primary Ghost</Button>
                <Button variant="hv-secondary-ghost">Secondary Ghost</Button>
                <Button variant="hv-accent-ghost">Accent Ghost</Button>
              </div>
            </div>

            {/* Semantic buttons */}
            <div className="space-y-2">
              <h4 className="font-medium">Semantic Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="hv-success">Success</Button>
                <Button variant="hv-warning">Warning</Button>
                <Button variant="hv-error">Error</Button>
                <Button variant="hv-info">Info</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neutral Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🪨 Neutral - Calcaire</CardTitle>
          <CardDescription>Échelle neutre pour textes et arrière-plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-hv-neutral-50 border p-4 rounded text-center text-xs">50</div>
            <div className="bg-hv-neutral-100 p-4 rounded text-center text-xs">100</div>
            <div className="bg-hv-neutral-200 p-4 rounded text-center text-xs">200</div>
            <div className="bg-hv-neutral-300 p-4 rounded text-center text-xs">300</div>
            <div className="bg-hv-neutral-400 p-4 rounded text-center text-xs text-white">400</div>
            <div className="bg-hv-neutral-500 p-4 rounded text-center text-xs text-white">500</div>
            <div className="bg-hv-neutral-600 p-4 rounded text-center text-xs text-white">600</div>
            <div className="bg-hv-neutral-700 p-4 rounded text-center text-xs text-white">700</div>
            <div className="bg-hv-neutral-800 p-4 rounded text-center text-xs text-white">800</div>
            <div className="bg-hv-neutral-900 p-4 rounded text-center text-xs text-white">900</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}