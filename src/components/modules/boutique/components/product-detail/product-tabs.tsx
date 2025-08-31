/**
 * Product Tabs Navigation
 * 
 * Sticky tab navigation with auto-scroll behavior
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  onTabClick: (tabId: string) => void
}

export function ProductTabs({ activeTab, onTabChange, onTabClick }: ProductTabsProps) {
  return (
    <nav className="sticky top-4 z-10 bg-background/80 backdrop-blur-sm border-b pb-4" role="tablist" aria-label="Sections du produit">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger 
            value="description"
            onClick={() => onTabClick('description')}
            className="text-sm font-medium"
            role="tab"
            aria-controls="description-panel"
            aria-selected={activeTab === 'description'}
          >
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="properties"
            onClick={() => onTabClick('properties')}
            className="text-sm font-medium"
            role="tab"
            aria-controls="properties-panel"
            aria-selected={activeTab === 'properties'}
          >
            Propriétés
          </TabsTrigger>
          <TabsTrigger 
            value="composition"
            onClick={() => onTabClick('composition')}
            className="text-sm font-medium"
            role="tab"
            aria-controls="composition-panel"
            aria-selected={activeTab === 'composition'}
          >
            Composition
          </TabsTrigger>
          <TabsTrigger 
            value="usage"
            onClick={() => onTabClick('usage')}
            className="text-sm font-medium"
            role="tab"
            aria-controls="usage-panel"
            aria-selected={activeTab === 'usage'}
          >
            Utilisation
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </nav>
  )
}