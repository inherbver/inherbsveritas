/**
 * Showcase des composants typographiques HerbisVeritas
 * Démontre toute la hiérarchie et les variantes selon le guide typographique
 */
import { Heading, Text, Quote, Slogan, Label, Link } from '@/components/ui/typography'

export default function TypographyShowcase() {
  return (
    <div className="container mx-auto py-12 space-y-16">
      <div className="text-center space-y-4">
        <Heading level="h1" variant="primary">
          Système Typographique HerbisVeritas
        </Heading>
        <Text size="lg" variant="muted">
          Playfair Display pour l'élégance, Montserrat pour la lisibilité
        </Text>
      </div>

      {/* Hiérarchie des titres */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Hiérarchie des Titres</Heading>
        
        <div className="space-y-6 bg-hv-neutral-50 p-8 rounded-lg">
          <div className="space-y-2">
            <Heading level="h1">H1 - Hero & Titres Principaux</Heading>
            <Text size="xs" variant="muted">
              Playfair Display Bold • 40px mobile → 64px desktop
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h2">H2 - Sections Majeures</Heading>
            <Text size="xs" variant="muted">
              Playfair Display SemiBold • 28px mobile → 40px desktop
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h3">H3 - Sous-sections</Heading>
            <Text size="xs" variant="muted">
              Montserrat Medium • 22px mobile → 28px desktop
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h4">H4 - Titres Cartes Produit</Heading>
            <Text size="xs" variant="muted">
              Montserrat Medium • 18px mobile → 22px desktop
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h5">H5 - Labels (ex: "Ingrédients")</Heading>
            <Text size="xs" variant="muted">
              Montserrat SemiBold • 16px mobile → 18px desktop
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h6">H6 - Petits Titres & Tags</Heading>
            <Text size="xs" variant="muted">
              Montserrat Bold • 14px mobile → 16px desktop
            </Text>
          </div>
        </div>
      </section>

      {/* Variantes de couleur */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Variantes de Couleur</Heading>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Heading level="h3" variant="default">Titre par Défaut</Heading>
            <Heading level="h3" variant="primary">Titre Primary (Vert Olivier)</Heading>
            <Heading level="h3" variant="secondary">Titre Secondary (Lavande)</Heading>
            <Heading level="h3" variant="accent">Titre Accent (Soleil)</Heading>
            <Heading level="h3" variant="muted">Titre Muted</Heading>
          </div>
          
          <div className="space-y-4">
            <Text variant="default">Texte par défaut avec Montserrat Regular</Text>
            <Text variant="primary" weight="medium">Texte primary medium</Text>
            <Text variant="secondary" weight="semibold">Texte secondary semibold</Text>
            <Text variant="accent" weight="bold">Texte accent bold</Text>
            <Text variant="muted">Texte muted pour informations secondaires</Text>
          </div>
        </div>
      </section>

      {/* Texte courant & Editorial */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Texte Courant & Éditorial</Heading>
        
        <div className="prose prose-neutral max-w-none">
          <Text size="lg" weight="medium" className="mb-4">
            Paragraphe d'introduction avec taille large et poids medium. 
            Utilisé pour mettre en avant les informations importantes.
          </Text>
          
          <Text className="mb-4">
            Paragraphe standard avec Montserrat Regular 16-18px. Interlignage de 1.65 
            pour un confort de lecture optimal. Idéal pour les descriptions produits 
            et le contenu magazine d'HerbisVeritas.
          </Text>
          
          <Text size="sm" variant="muted" className="mb-6">
            Petit paragraphe 14-15px pour les légendes et informations complémentaires. 
            Couleur muted pour hiérarchiser l'information.
          </Text>

          <Quote size="base" variant="primary">
            "La beauté naturelle révèle l'essence authentique de chaque être. 
            Nos produits bio célèbrent cette vérité universelle."
          </Quote>
          
          <Text size="xs" variant="muted" className="text-right mt-2">
            — Témoignage client HerbisVeritas
          </Text>
        </div>
      </section>

      {/* Slogans & Punchlines */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Slogans & Punchlines</Heading>
        
        <div className="bg-gradient-to-br from-hv-primary-50 to-hv-secondary-50 p-8 rounded-xl text-center space-y-6">
          <Slogan variant="gradient" size="hero">
            L'Authentique Beauté Naturelle
          </Slogan>
          
          <Slogan variant="primary" size="large">
            Révélez Votre Éclat Naturel
          </Slogan>
          
          <Slogan variant="accent" size="base">
            Bio • Artisanal • Méditerranéen
          </Slogan>
        </div>
      </section>

      {/* Interface & Navigation */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Interface & Navigation</Heading>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Heading level="h5">Labels & Tags</Heading>
            <div className="flex flex-wrap gap-2">
              <Label variant="primary">Bio Certifié</Label>
              <Label variant="secondary">Artisanal</Label>
              <Label variant="accent">Promo -20%</Label>
              <Label variant="success">Nouveau</Label>
              <Label variant="warning">Dernières Pièces</Label>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Label size="xs" variant="primary" rounded="full">Vegan</Label>
              <Label size="xs" variant="secondary" rounded="full">Sans Paraben</Label>
              <Label size="xs" variant="accent" rounded="full">Made in France</Label>
            </div>
          </div>
          
          <div className="space-y-4">
            <Heading level="h5">Liens & Navigation</Heading>
            <div className="space-y-2">
              <div><Link variant="default" href="#">Lien par défaut (Primary)</Link></div>
              <div><Link variant="secondary" href="#">Lien secondary (Lavande)</Link></div>
              <div><Link variant="accent" href="#">Lien accent (Soleil)</Link></div>
              <div><Link variant="muted" href="#">Lien muted discret</Link></div>
              <div><Link variant="inherit" href="#">Lien héritant la couleur parent</Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* E-commerce spécifique */}
      <section className="space-y-8">
        <Heading level="h2" variant="primary">Spécificités E-commerce</Heading>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-hv-neutral-200 rounded-lg p-6 space-y-4">
            <Heading level="h4">Crème Hydratante Olive</Heading>
            <Text size="sm" variant="muted">Soin visage bio • 50ml</Text>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Text weight="semibold" size="lg" variant="accent">32,90 €</Text>
                <Text size="xs" variant="muted" className="line-through">36,90 €</Text>
              </div>
              <Label variant="accent" size="xs">-10%</Label>
            </div>
          </div>

          <div className="bg-white border border-hv-neutral-200 rounded-lg p-6 space-y-4">
            <Heading level="h4">Savon Lavande Provence</Heading>
            <Text size="sm" variant="muted">Artisanal • 100g</Text>
            <div className="flex items-center justify-between">
              <Text weight="semibold" size="lg">15,90 €</Text>
              <Label variant="primary" size="xs">Bio</Label>
            </div>
          </div>

          <div className="bg-white border border-hv-neutral-200 rounded-lg p-6 space-y-4">
            <Heading level="h4">Coffret Découverte</Heading>
            <Text size="sm" variant="muted">5 produits essentiels</Text>
            <div className="flex items-center justify-between">
              <Text weight="semibold" size="lg">89,90 €</Text>
              <Label variant="success" size="xs">Nouveau</Label>
            </div>
          </div>
        </div>
      </section>

      {/* Guide d'usage */}
      <section className="bg-hv-neutral-50 p-8 rounded-xl space-y-6">
        <Heading level="h2" variant="primary">Guide d'Usage Rapide</Heading>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Heading level="h5">Principes</Heading>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Playfair Display</strong> : Titres H1-H2 uniquement</li>
              <li>• <strong>Montserrat</strong> : Corps de texte et interface</li>
              <li>• <strong>Hiérarchie respectée</strong> : H1 → H6 avec cohérence</li>
              <li>• <strong>Responsive automatique</strong> : via clamp() CSS</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Heading level="h5">Classes Tailwind</Heading>
            <div className="font-mono text-sm space-y-1 bg-white p-4 rounded border">
              <div>font-display = Playfair Display</div>
              <div>font-sans = Montserrat</div>
              <div>text-4xl = H1 (40→64px)</div>
              <div>text-2xl = H2 (28→40px)</div>
              <div>text-xl = H3 (22→28px)</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}