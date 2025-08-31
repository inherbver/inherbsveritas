'use client'

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InciList } from "@/components/ui/inci-list"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { 
  Product, 
  LABEL_DISPLAY, 
  LABEL_BADGE_VARIANTS 
} from "@/types/product"
import { Minus, Plus } from "lucide-react"

export interface ProductDetailProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => Promise<void>
  className?: string
}

// Fonction pour parser le texte multi-lignes (propriétés, utilisation)
function parseMultilineText(text: string | undefined): string[] {
  if (!text) return []
  return text.split(/\n|\\n/).filter(line => line.trim().length > 0)
}

// Hook pour auto-scroll des onglets avec Intersection Observer
function useTabAutoScroll() {
  const [activeTab, setActiveTab] = React.useState('description')
  
  React.useEffect(() => {
    const sections = [
      { id: 'description', element: document.getElementById('description') },
      { id: 'properties', element: document.getElementById('properties') },
      { id: 'composition', element: document.getElementById('composition') },
      { id: 'usage', element: document.getElementById('usage') }
    ].filter(section => section.element)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = sections.find(s => s.element === entry.target)
            if (section) {
              setActiveTab(section.id)
            }
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    sections.forEach(section => {
      if (section.element) observer.observe(section.element)
    })

    return () => observer.disconnect()
  }, [])

  return { activeTab, setActiveTab }
}

export function ProductDetail({
  product,
  onAddToCart,
  className
}: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const { activeTab, setActiveTab } = useTabAutoScroll()

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta))
    setQuantity(newQuantity)
  }

  const handleAddToCart = async () => {
    if (!onAddToCart || isAddingToCart) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    // Scroll vers la section avec offset pour sticky nav
    const element = document.getElementById(tabId)
    if (element) {
      const offset = 100 // Hauteur de la navigation sticky
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  return (
    <article 
      className={cn("max-w-7xl mx-auto", className)}
      itemScope 
      itemType="https://schema.org/Product"
    >
      {/* Layout 2 colonnes MD+ / Stack vertical mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" role="main">
        
        {/* Colonne Image */}
        <section className="space-y-4">
          <figure className="relative overflow-hidden rounded-lg">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto object-contain bg-gray-50"
                itemProp="image"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">Image à venir</span>
              </div>
            )}
          </figure>
        </section>

        {/* Colonne Informations */}
        <section className="space-y-6">
          
          {/* Section principale */}
          <header className="space-y-4">
            {/* Titre H1 + Unité */}
            <div>
              <h1 
                className="font-serif text-3xl md:text-4xl font-bold mb-2"
                itemProp="name"
              >
                {product.name}
              </h1>
              {product.unit && (
                <p className="text-lg text-muted-foreground italic">
                  {product.unit}
                </p>
              )}
            </div>

            {/* Description courte introductive */}
            {product.description_short && (
              <p 
                className="text-lg text-muted-foreground leading-relaxed"
                itemProp="description"
              >
                {product.description_short}
              </p>
            )}

            {/* Labels HerbisVeritas */}
            {product.labels.length > 0 && (
              <aside className="flex flex-wrap gap-2" role="complementary" aria-label="Labels de qualité">
                {product.labels.map((label) => (
                  <Badge
                    key={label}
                    variant={LABEL_BADGE_VARIANTS[label] as any}
                    className="text-sm px-3 py-1"
                  >
                    {LABEL_DISPLAY[label]}
                  </Badge>
                ))}
              </aside>
            )}

            {/* Prix avec mention TTC */}
            <section className="space-y-2" itemScope itemType="https://schema.org/Offer" aria-label="Prix et disponibilité">
              <div className="text-2xl font-bold text-primary">
                <span itemProp="price" content={product.price.toString()}>
                  {formatPrice(product.price, product.currency)}
                </span>
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  TTC
                </span>
              </div>
              <meta itemProp="priceCurrency" content={product.currency} />
              <meta 
                itemProp="availability" 
                content={product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} 
              />
            </section>
          </header>

          {/* Zone d'achat - Card avec ombre */}
          <Card className="p-6 shadow-lg border-2 border-primary/10" role="form" aria-label="Ajouter au panier">
            <CardContent className="p-0 space-y-4">
              
              {/* Sélecteur quantité */}
              <fieldset className="space-y-2">
                <label className="text-sm font-medium">Quantité :</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                      setQuantity(value)
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </fieldset>

              {/* Indicateur stock */}
              {product.stock > 0 && product.stock <= 5 && (
                <aside className="text-sm text-amber-600" role="status" aria-live="polite">
                  ⚠️ Plus que {product.stock} en stock
                </aside>
              )}

              {/* Bouton ajout panier large */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isAddingToCart && <Spinner size="sm" className="mr-2" />}
                {isAddingToCart 
                  ? 'Ajout en cours...' 
                  : product.stock === 0 
                    ? 'Produit en rupture' 
                    : `Ajouter ${quantity} au panier`
                }
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sections détaillées avec onglets */}
      <section className="space-y-8">
        
        {/* Navigation sticky avec tabs */}
        <nav className="sticky top-4 z-10 bg-background/80 backdrop-blur-sm border-b pb-4" role="tablist" aria-label="Sections du produit">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger 
                value="description"
                onClick={() => handleTabClick('description')}
                className="text-sm font-medium"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="properties"
                onClick={() => handleTabClick('properties')}
                className="text-sm font-medium"
              >
                Propriétés
              </TabsTrigger>
              <TabsTrigger 
                value="composition"
                onClick={() => handleTabClick('composition')}
                className="text-sm font-medium"
              >
                Composition
              </TabsTrigger>
              <TabsTrigger 
                value="usage"
                onClick={() => handleTabClick('usage')}
                className="text-sm font-medium"
              >
                Utilisation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>

        {/* Contenu des sections */}
        <div className="space-y-16">
          
          {/* 1. Description */}
          <section id="description" className="scroll-mt-24" role="tabpanel" aria-labelledby="description-tab">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-serif text-2xl font-bold mb-6">Description</h2>
              <div className="text-muted-foreground leading-relaxed">
                {product.description_long ? (
                  <p>{product.description_long}</p>
                ) : (
                  <p>Description détaillée à venir...</p>
                )}
              </div>
            </div>
          </section>

          {/* 2. Propriétés */}
          <section id="properties" className="scroll-mt-24" role="tabpanel" aria-labelledby="properties-tab">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-serif text-2xl font-bold mb-6">Propriétés</h2>
              {product.properties ? (
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  {parseMultilineText(product.properties).map((property, index) => (
                    <li key={index}>{property}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Propriétés à venir...</p>
              )}
            </div>
          </section>

          {/* 3. Composition */}
          <section id="composition" className="scroll-mt-24" role="tabpanel" aria-labelledby="composition-tab">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-serif text-2xl font-bold mb-6">Composition</h2>
              
              {/* Texte composition */}
              {product.compositionText && (
                <div className="mb-6 text-muted-foreground leading-relaxed">
                  <p>{product.compositionText}</p>
                </div>
              )}

              {/* Liste INCI Grid 2 colonnes */}
              {product.inci_list && product.inci_list.length > 0 && (
                <div className="mt-6">
                  <InciList 
                    inciList={product.inci_list}
                    variant="full"
                    showCommonNames={true}
                    showFunctions={true}
                    locale="fr"
                  />
                </div>
              )}

              {!product.compositionText && (!product.inci_list || product.inci_list.length === 0) && (
                <p className="text-muted-foreground">Composition détaillée à venir...</p>
              )}
            </div>
          </section>

          {/* 4. Utilisation */}
          <section id="usage" className="scroll-mt-24" role="tabpanel" aria-labelledby="usage-tab">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-serif text-2xl font-bold mb-6">Mode d&apos;emploi</h2>
              {product.usageInstructions ? (
                <div className="space-y-4 text-muted-foreground">
                  {parseMultilineText(product.usageInstructions).map((instruction, index) => (
                    <p key={index} className="leading-relaxed">{instruction}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Instructions d&apos;utilisation à venir...</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </article>
  )
}