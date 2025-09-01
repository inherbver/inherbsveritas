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

      {/* Typography & Spacing Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🔤 Typography & Spacing Tokens</CardTitle>
          <CardDescription>Tokens de typographie fluide + espacements sémantiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Typography Scale */}
            <div className="space-y-4">
              <h4 className="font-semibold">Tailles fluides (clamp responsive)</h4>
              <div className="space-y-2">
                <div className="text-xs">text-xs • Taille XS fluide (12-14px)</div>
                <div className="text-sm">text-sm • Taille SM fluide (14-15px)</div>
                <div className="text-base">text-base • Taille MD/body fluide (16-18px)</div>
                <div className="text-lg">text-lg • Taille LG fluide (18-22px)</div>
                <div className="text-xl">text-xl • Taille XL fluide (22-28px)</div>
                <div className="text-2xl">text-2xl • Taille 2XL fluide (28-36px)</div>
                <div className="text-3xl">text-3xl • Taille 3XL fluide (36-48px)</div>
              </div>
            </div>

            {/* Font Weights */}
            <div className="space-y-4">
              <h4 className="font-semibold">Poids de police</h4>
              <div className="space-y-2">
                <div className="font-regular">font-regular • Poids regular (400)</div>
                <div className="font-medium">font-medium • Poids medium (500)</div>
                <div className="font-semibold">font-semibold • Poids semibold (600)</div>
                <div className="font-bold">font-bold • Poids bold (700)</div>
              </div>
            </div>

            {/* Spacing Scale */}
            <div className="space-y-4">
              <h4 className="font-semibold">Échelle d'espacement (4px base)</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-2xs h-4 rounded"></div>
                  <span>w-2xs • 4px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-xs h-4 rounded"></div>
                  <span>w-xs • 8px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-sm h-4 rounded"></div>
                  <span>w-sm • 12px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-md h-4 rounded"></div>
                  <span>w-md • 16px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-lg h-4 rounded"></div>
                  <span>w-lg • 24px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-hv-primary w-xl h-4 rounded"></div>
                  <span>w-xl • 32px</span>
                </div>
              </div>
            </div>

            {/* Semantic Spacing */}
            <div className="space-y-4">
              <h4 className="font-semibold">Espacement sémantique</h4>
              <div className="space-y-4">
                <div className="p-card-pad bg-hv-primary-50 rounded border">
                  <code>p-card-pad</code> • Padding carte (24px)
                </div>
                <div className="p-page-pad bg-hv-secondary-50 rounded border">
                  <code>p-page-pad</code> • Padding page (48px)
                </div>
              </div>
            </div>

            {/* Shadows */}
            <div className="space-y-4">
              <h4 className="font-semibold">Élévation / Ombres</h4>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded shadow-sm border text-center">
                  <code>shadow-sm</code>
                  <br />
                  <small className="text-hv-neutral-500">Légère</small>
                </div>
                <div className="p-6 bg-white rounded shadow-md border text-center">
                  <code>shadow-md</code>
                  <br />
                  <small className="text-hv-neutral-500">Moyenne</small>
                </div>
                <div className="p-6 bg-white rounded shadow-lg border text-center">
                  <code>shadow-lg</code>
                  <br />
                  <small className="text-hv-neutral-500">Large</small>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}