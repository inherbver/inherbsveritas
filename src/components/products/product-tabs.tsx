'use client'

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Beaker, Lightbulb, Sparkles, Shield } from "lucide-react"

import type { Product } from '@/types/product'

interface ProductTabsProps {
  product: Product
}

interface TabConfig {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  condition: (product: Product) => boolean
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'description',
    label: 'Description',
    icon: Info,
    condition: (product) => !!product.description_long
  },
  {
    id: 'inci',
    label: 'INCI',
    icon: Beaker,
    condition: (product) => !!product.inci_list && product.inci_list.length > 0
  },
  {
    id: 'usage',
    label: 'Usage',
    icon: Lightbulb,
    condition: (product) => !!product.usageInstructions
  },
  {
    id: 'properties',
    label: 'Propriétés',
    icon: Sparkles,
    condition: (product) => !!product.properties
  },
  {
    id: 'conservation',
    label: 'Conservation',
    icon: Shield,
    condition: () => true // Toujours affiché
  }
]

export function ProductTabs({ product }: ProductTabsProps) {
  const availableTabs = React.useMemo(() => {
    return TAB_CONFIGS.filter(tab => tab.condition(product))
  }, [product])

  const defaultTab = availableTabs[0]?.id || 'conservation'

  if (availableTabs.length === 0) return null

  return (
    <section className="w-full" aria-label="Informations détaillées du produit">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:flex md:w-auto md:justify-start overflow-x-auto">
          {availableTabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger 
              key={id} 
              value={id}
              className="flex items-center gap-2 min-w-0 shrink-0"
              aria-label={`Voir ${label.toLowerCase()} du produit`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <DescriptionTab content={product.description_long} />
        </TabsContent>

        <TabsContent value="inci" className="mt-4">
          <InciTab ingredients={product.inci_list} />
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <UsageTab instructions={product.usageInstructions} />
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <PropertiesTab properties={product.properties} />
        </TabsContent>

        <TabsContent value="conservation" className="mt-4">
          <ConservationTab />
        </TabsContent>
      </Tabs>
    </section>
  )
}

const DescriptionTab = React.memo(({ content }: { content?: string | undefined }) => (
  <article className="prose prose-sm max-w-none">
    <p className="text-muted-foreground leading-relaxed">{content || 'Aucune description disponible'}</p>
  </article>
))
DescriptionTab.displayName = 'DescriptionTab'

const InciTab = React.memo(({ ingredients }: { ingredients?: string[] | undefined }) => (
  <section className="space-y-4">
    <header>
      <h4 className="font-semibold text-sm">Composition INCI :</h4>
    </header>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      {ingredients?.map((ingredient, index) => (
        <li key={index} className="text-muted-foreground bg-muted/30 px-3 py-2 rounded">
          {ingredient}
        </li>
      )) || <p className="text-muted-foreground italic">Aucun ingrédient disponible</p>}
    </ul>
  </section>
))
InciTab.displayName = 'InciTab'

const UsageTab = React.memo(({ instructions }: { instructions?: string | undefined }) => (
  <section className="space-y-4">
    <header>
      <h4 className="font-semibold text-sm">Mode &apos;emploi :</h4>
    </header>
    <article className="prose prose-sm max-w-none">
      <p className="text-muted-foreground leading-relaxed">{instructions || 'Aucune instruction disponible'}</p>
    </article>
  </section>
))
UsageTab.displayName = 'UsageTab'

const PropertiesTab = React.memo(({ properties }: { properties?: string | undefined }) => (
  <section className="space-y-4">
    <header>
      <h4 className="font-semibold text-sm">Propriétés du produit :</h4>
    </header>
    <ul className="space-y-2">
      {properties?.split('\\n').map((property, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <span className="text-primary mt-1">•</span>
          <span className="text-muted-foreground">{property}</span>
        </li>
      )) || <p className="text-muted-foreground italic">Aucune propriété disponible</p>}
    </ul>
  </section>
))
PropertiesTab.displayName = 'PropertiesTab'

const ConservationTab = React.memo(() => (
  <section className="space-y-4">
    <header>
      <h4 className="font-semibold text-sm">Conseils de conservation :</h4>
    </header>
    <ul className="space-y-3 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-primary mt-0.5" />
        <span>Conserver dans un endroit frais et sec</span>
      </li>
      <li className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-primary mt-0.5" />
        <span>Éviter &apos;exposition directe au soleil</span>
      </li>
      <li className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-primary mt-0.5" />
        <span>Refermer soigneusement après usage</span>
      </li>
    </ul>
  </section>
))
ConservationTab.displayName = 'ConservationTab'