/**
 * Product Detail Sections
 * 
 * Tabbed content sections for description, properties, composition, usage
 */

import { InciList } from "@/components/ui/inci-list"
import { Product } from "@/types/product"

interface ProductSectionsProps {
  product: Product
}

// Fonction pour parser le texte multi-lignes (propriétés, utilisation)
function parseMultilineText(text: string | undefined): string[] {
  if (!text) return []
  return text.split(/\n|\\n/).filter(line => line.trim().length > 0)
}

export function ProductSections({ product }: ProductSectionsProps) {
  return (
    <div className="space-y-16">
      
      {/* 1. Description */}
      <section 
        id="description" 
        className="scroll-mt-24" 
        role="tabpanel" 
        aria-labelledby="description-tab"
        data-section="description"
      >
        <article className="prose prose-lg max-w-none">
          <header>
            <h2 className="font-serif text-2xl font-bold mb-6">Description</h2>
          </header>
          <div className="text-muted-foreground leading-relaxed">
            {product.description_long ? (
              <p>{product.description_long}</p>
            ) : (
              <p>Description détaillée à venir...</p>
            )}
          </div>
        </article>
      </section>

      {/* 2. Propriétés */}
      <section 
        id="properties" 
        className="scroll-mt-24" 
        role="tabpanel" 
        aria-labelledby="properties-tab"
        data-section="properties"
      >
        <article className="prose prose-lg max-w-none">
          <header>
            <h2 className="font-serif text-2xl font-bold mb-6">Propriétés</h2>
          </header>
          {product.properties ? (
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              {parseMultilineText(product.properties).map((property, index) => (
                <li key={index}>{property}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Propriétés à venir...</p>
          )}
        </article>
      </section>

      {/* 3. Composition */}
      <section 
        id="composition" 
        className="scroll-mt-24" 
        role="tabpanel" 
        aria-labelledby="composition-tab"
        data-section="composition"
      >
        <article className="prose prose-lg max-w-none">
          <header>
            <h2 className="font-serif text-2xl font-bold mb-6">Composition</h2>
          </header>
          
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
        </article>
      </section>

      {/* 4. Utilisation */}
      <section 
        id="usage" 
        className="scroll-mt-24" 
        role="tabpanel" 
        aria-labelledby="usage-tab"
        data-section="usage"
      >
        <article className="prose prose-lg max-w-none">
          <header>
            <h2 className="font-serif text-2xl font-bold mb-6">Mode d&apos;emploi</h2>
          </header>
          {product.usageInstructions ? (
            <div className="space-y-4 text-muted-foreground">
              {parseMultilineText(product.usageInstructions).map((instruction, index) => (
                <p key={index} className="leading-relaxed">{instruction}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Instructions d&apos;utilisation à venir...</p>
          )}
        </article>
      </section>
    </div>
  )
}