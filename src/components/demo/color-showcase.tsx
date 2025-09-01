'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher, SimpleThemeToggle } from '@/components/theme/theme-switcher'
import { ColorPalette } from './color-showcase/color-palette'
import { ButtonVariants } from './color-showcase/button-variants'
import { TypographyTokens } from './color-showcase/typography-tokens'

// Demo component pour showcase du design system HerbisVeritas
export function ColorShowcase() {
  const brandColors = [
    {
      colorName: "Primary",
      colorPrefix: "hv-primary",
      icon: "🌱",
      description: "Vert Olivier"
    },
    {
      colorName: "Secondary", 
      colorPrefix: "hv-secondary",
      icon: "🌸",
      description: "Lavande"
    },
    {
      colorName: "Accent",
      colorPrefix: "hv-accent", 
      icon: "☀️",
      description: "Soleil"
    }
  ];

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
            {brandColors.map((color) => (
              <ColorPalette key={color.colorPrefix} {...color} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-hv-primary">🔘 Button Variants</CardTitle>
          <CardDescription>Toutes les variantes de boutons HerbisVeritas + standards</CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonVariants />
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
            {Array.from({ length: 10 }, (_, i) => {
              const shade = i === 0 ? 50 : i * 100;
              const isLight = shade <= 300;
              const textColor = isLight ? 'text-gray-800' : 'text-white';
              const borderClass = shade === 50 ? 'border' : '';
              
              return (
                <div
                  key={shade}
                  className={`bg-hv-neutral-${shade} ${borderClass} p-4 rounded text-center text-xs ${textColor}`}
                >
                  {shade}
                </div>
              );
            })}
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
          <TypographyTokens />
        </CardContent>
      </Card>
    </div>
  )
}