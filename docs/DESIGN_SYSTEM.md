# Design System - HerbisVeritas V2

## 🎨 Vue d'Ensemble

Ce document définit le système de design complet pour HerbisVeritas V2, basé sur **Tailwind CSS v4** et **shadcn/ui** avec des composants **Radix UI** pour une expérience utilisateur cohérente et accessible.

---

## 🏗️ Architecture du Design System

### Stack Technologique

```typescript
// Configuration principale
- Tailwind CSS v4       → Framework CSS utilitaire
- shadcn/ui            → Bibliothèque de composants
- Radix UI Primitives  → Composants accessibles
- CSS Variables        → Thématisation dynamique
- Lucide React         → Icônes consistantes
- Framer Motion        → Animations fluides
```

### Structure des Fichiers

```
src/
├── components/ui/           # Composants shadcn/ui
│   ├── button.tsx          # Boutons avec variants
│   ├── input.tsx           # Champs de saisie
│   ├── card.tsx            # Cartes de contenu
│   └── ...                 # Autres composants UI
├── lib/
│   ├── cn.ts               # Utilitaire className
│   └── variants.ts         # Variants avec cva
├── styles/
│   ├── globals.css         # Variables CSS globales
│   └── components.css      # Styles composants
└── tailwind.config.ts      # Configuration Tailwind
```

---

## 🎭 Système de Thématisation

### Variables CSS Principales

```css
/* styles/globals.css */
:root {
  /* === COULEURS PRIMAIRES === */
  --primary: 142 70% 49%;        /* #4ade80 - Vert nature */
  --primary-foreground: 0 0% 98%; /* Texte sur primaire */
  
  /* === COULEURS SÉMANTIQUES === */
  --success: 142 76% 36%;        /* #16a34a - Succès */
  --warning: 43 96% 56%;         /* #facc15 - Avertissement */
  --error: 0 84% 60%;            /* #ef4444 - Erreur */
  --info: 221 83% 53%;           /* #3b82f6 - Information */
  
  /* === COULEURS NEUTRES === */
  --background: 0 0% 100%;       /* Fond principal */
  --foreground: 240 10% 3.9%;   /* Texte principal */
  --muted: 210 40% 96%;          /* Fond muted */
  --muted-foreground: 215.4 16.3% 46.9%; /* Texte muted */
  
  /* === BORDURES ET SÉPARATEURS === */
  --border: 214.3 31.8% 91.4%;  /* Bordures */
  --input: 214.3 31.8% 91.4%;   /* Bordures input */
  --ring: 142 70% 49%;           /* Focus ring */
  
  /* === SURFACES === */
  --card: 0 0% 100%;             /* Fond cartes */
  --card-foreground: 240 10% 3.9%; /* Texte cartes */
  --popover: 0 0% 100%;          /* Fond popovers */
  --popover-foreground: 240 10% 3.9%; /* Texte popovers */
  
  /* === ÉTATS INTERACTIFS === */
  --accent: 210 40% 96%;         /* Accent hover */
  --accent-foreground: 222.2 84% 4.9%; /* Texte accent */
  --destructive: 0 84% 60%;      /* Actions destructives */
  --destructive-foreground: 210 40% 98%; /* Texte destructif */
}

/* Mode sombre */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 142 70% 49%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... autres variables dark mode */
}
```

### Palette Couleurs Étendue

```typescript
// lib/design-tokens.ts
export const colors = {
  // === PALETTE NATURE (Primaire) ===
  nature: {
    50: '#f0fdf4',   // Très clair
    100: '#dcfce7',  // Clair
    200: '#bbf7d0',  // Moyen clair
    300: '#86efac',  // Moyen
    400: '#4ade80',  // Principal (primary)
    500: '#22c55e',  // Foncé
    600: '#16a34a',  // Très foncé
    700: '#15803d',  // Sombre
    800: '#166534',  // Très sombre
    900: '#14532d',  // Ultra sombre
  },
  
  // === PALETTE TERRE (Secondaire) ===
  terre: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',  // Secondaire
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // === SÉMANTIQUES ===
  semantic: {
    success: '#16a34a',
    warning: '#facc15',
    error: '#ef4444',
    info: '#3b82f6',
  }
} as const
```

---

## 📝 Composants UI Fondamentaux

### Système de Boutons

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Classes de base
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Bouton principal
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Bouton destructif
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Bouton outline
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        // Bouton secondaire
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        // Bouton fantôme
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // Lien
        link: "text-primary underline-offset-4 hover:underline",
        
        // === VARIANTS HERBISVERITAS ===
        nature: "bg-nature-400 text-white hover:bg-nature-500 shadow-lg",
        terre: "bg-terre-400 text-white hover:bg-terre-500",
        success: "bg-semantic-success text-white hover:bg-green-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      // Nouveau: États spéciaux
      state: {
        default: "",
        loading: "cursor-not-allowed opacity-70",
        success: "bg-semantic-success text-white",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

// Usage avec états de chargement
interface ButtonProps extends VariantProps<typeof buttonVariants> {
  loading?: boolean
  success?: boolean
}

export const Button = ({ loading, success, ...props }) => {
  const variant = success ? 'success' : props.variant
  const state = loading ? 'loading' : (success ? 'success' : 'default')
  
  return (
    <button 
      className={buttonVariants({ variant, size: props.size, state })}
      disabled={loading || props.disabled}
    >
      {loading && <Spinner className="mr-2" />}
      {success && <Check className="mr-2" />}
      {props.children}
    </button>
  )
}
```

### Système de Cartes

```typescript
// components/ui/card.tsx
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-md hover:shadow-lg transition-shadow",
        interactive: "border-border hover:border-primary/50 cursor-pointer transition-colors",
        success: "border-semantic-success/20 bg-semantic-success/5",
        warning: "border-semantic-warning/20 bg-semantic-warning/5",
        error: "border-semantic-error/20 bg-semantic-error/5",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

// Composants de carte spécialisés
export const ProductCard = ({ product, ...props }) => (
  <Card variant="interactive" {...props}>
    <CardHeader>
      <img src={product.image} alt={product.name} className="aspect-square object-cover rounded-md" />
    </CardHeader>
    <CardContent>
      <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
      <p className="text-muted-foreground text-sm mt-2">{product.description}</p>
      <div className="flex items-center justify-between mt-4">
        <Price value={product.price} className="text-lg font-bold text-nature-600" />
        <Button variant="nature" size="sm">Ajouter</Button>
      </div>
    </CardContent>
  </Card>
)

export const MarketCard = ({ market, ...props }) => (
  <Card variant="elevated" {...props}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-nature-500" />
        {market.name}
      </CardTitle>
      <CardDescription>
        <Calendar className="h-4 w-4 inline mr-1" />
        {formatDate(market.nextOccurrence)}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{market.description}</p>
      <div className="flex items-center mt-4 text-sm">
        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
        {market.hours}
      </div>
    </CardContent>
  </Card>
)
```

### Système de Formulaires

```typescript
// components/ui/input.tsx
const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-semantic-error focus-visible:ring-semantic-error",
        success: "border-semantic-success focus-visible:ring-semantic-success",
      },
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Composant Input avec gestion d'état
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, size, error, success, ...props }, ref) => {
    const inputVariant = error ? 'error' : (success ? 'success' : variant)
    
    return (
      <div className="space-y-2">
        <input
          className={inputVariants({ variant: inputVariant, size })}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-semantic-error flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-semantic-success flex items-center gap-1">
            <Check className="h-4 w-4" />
            Valide
          </p>
        )}
      </div>
    )
  }
)
```

---

## 🎯 Composants Métier Spécialisés

### Composants E-commerce

```typescript
// components/common/Price.tsx
interface PriceProps {
  value: number
  currency?: 'EUR' | 'USD'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  variant?: 'default' | 'accent' | 'muted'
  showCurrency?: boolean
}

export const Price = ({ 
  value, 
  currency = 'EUR', 
  size = 'default',
  variant = 'default',
  showCurrency = true 
}: PriceProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-xl font-bold',
  }
  
  const variantClasses = {
    default: 'text-foreground',
    accent: 'text-nature-600',
    muted: 'text-muted-foreground',
  }
  
  return (
    <span className={cn(
      sizeClasses[size],
      variantClasses[variant],
      'font-mono' // Espacement uniforme des chiffres
    )}>
      {value.toFixed(2)}
      {showCurrency && <span className="ml-1 text-xs">€</span>}
    </span>
  )
}

// components/common/Badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background text-foreground",
        // États produits
        available: "bg-semantic-success/10 text-semantic-success",
        unavailable: "bg-semantic-error/10 text-semantic-error",
        limited: "bg-semantic-warning/10 text-semantic-warning",
        // États commandes
        pending: "bg-semantic-warning/10 text-semantic-warning",
        confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        delivered: "bg-semantic-success/10 text-semantic-success",
        cancelled: "bg-semantic-error/10 text-semantic-error",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    'available': { variant: 'available', label: 'Disponible' },
    'out-of-stock': { variant: 'unavailable', label: 'Épuisé' },
    'limited': { variant: 'limited', label: 'Stock limité' },
    'pending': { variant: 'pending', label: 'En attente' },
    'confirmed': { variant: 'confirmed', label: 'Confirmée' },
    'delivered': { variant: 'delivered', label: 'Livrée' },
    'cancelled': { variant: 'cancelled', label: 'Annulée' },
  }
  
  const config = statusMap[status] || { variant: 'default', label: status }
  
  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  )
}
```

### Composants de Navigation

```typescript
// components/layout/Header.tsx
export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="HerbisVeritas" className="h-8 w-auto" />
          <span className="font-bold text-xl text-nature-600">HerbisVeritas</span>
        </Link>
        
        {/* Navigation principale */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/products">Produits</NavLink>
          <NavLink href="/markets">Marchés</NavLink>
          <NavLink href="/magazine">Magazine</NavLink>
          <NavLink href="/about">À propos</NavLink>
        </nav>
        
        {/* Actions utilisateur */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <CartButton />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

// components/layout/NavLink.tsx
const navLinkVariants = cva(
  "text-sm font-medium transition-colors hover:text-primary relative",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground",
        active: "text-foreground after:absolute after:bottom-[-1rem] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:content-['']",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export const NavLink = ({ href, children, ...props }) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)
  
  return (
    <Link
      href={href}
      className={navLinkVariants({ variant: isActive ? 'active' : 'default' })}
      {...props}
    >
      {children}
    </Link>
  )
}
```

---

## 📱 Responsive Design System

### Breakpoints Tailwind

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'xs': '475px',    // Mobiles larges
      'sm': '640px',    // Tablettes petites
      'md': '768px',    // Tablettes
      'lg': '1024px',   // Desktop petits
      'xl': '1280px',   // Desktop
      '2xl': '1536px',  // Desktop larges
    },
    // ... reste de la configuration
  }
} satisfies Config
```

### Composants Responsives

```typescript
// components/layout/Container.tsx
const containerVariants = cva(
  "mx-auto px-4 sm:px-6 lg:px-8",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        default: "max-w-7xl",
        lg: "max-w-8xl",
        full: "max-w-full",
      }
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export const Container = ({ size, children, ...props }) => (
  <div className={containerVariants({ size })} {...props}>
    {children}
  </div>
)

// components/layout/Grid.tsx
interface GridProps {
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'sm' | 'default' | 'lg'
  children: React.ReactNode
}

export const Grid = ({ 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'default',
  children 
}: GridProps) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    default: 'gap-4',
    lg: 'gap-8',
  }
  
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gapClasses[gap]
  )
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Usage
<Grid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap="lg">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</Grid>
```

---

## ✨ Système d'Animations

### Animations avec Framer Motion

```typescript
// lib/animations.ts
export const animations = {
  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  // Slide from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  },
  
  // Scale animation
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },
  
  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}

// components/common/AnimatedCard.tsx
import { motion } from 'framer-motion'

export const AnimatedCard = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    {...props}
  >
    {children}
  </motion.div>
)

// Hook pour animations de liste
export const useStaggeredAnimation = (items: any[]) => {
  return {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    }
  }
}
```

### Transitions CSS

```css
/* styles/components.css */

/* Transitions globales */
.transition-smooth {
  @apply transition-all duration-200 ease-out;
}

.transition-slow {
  @apply transition-all duration-500 ease-out;
}

/* Hover effects */
.hover-lift {
  @apply transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg;
}

.hover-glow {
  @apply transition-all duration-200 ease-out hover:shadow-lg hover:shadow-primary/25;
}

/* Loading states */
.skeleton {
  @apply animate-pulse bg-muted rounded;
}

.loading-dots::after {
  content: '';
  @apply inline-block w-4 h-4 ml-1;
  background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 4px 4px;
  animation: loading-dots 1s infinite linear;
}

@keyframes loading-dots {
  0% { background-position: 0px 0px; }
  100% { background-position: 12px 0px; }
}

/* Focus states */
.focus-visible {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}
```

---

## 🎨 Guidelines de Styling

### Conventions de Nommage

```typescript
// ✅ BEM-like pour les composants complexes
.product-card {}
.product-card__image {}
.product-card__content {}
.product-card__actions {}
.product-card--featured {}
.product-card--compact {}

// ✅ Tailwind utilities pour la plupart des cas
<div className="flex items-center justify-between p-4 rounded-lg bg-card border">

// ✅ CSS variables pour la thématisation
.custom-component {
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
  color: hsl(var(--card-foreground));
}
```

### Bonnes Pratiques

```typescript
// ✅ Utiliser cn() pour combiner les classes
import { cn } from '@/lib/utils'

const className = cn(
  "base-classes",
  variant === 'primary' && "primary-classes",
  isActive && "active-classes",
  props.className // Permettre l'override
)

// ✅ Variants avec class-variance-authority
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-classes",
      primary: "primary-classes",
    },
    size: {
      default: "default-size",
      small: "small-size",
    }
  }
})

// ✅ Composants avec forwardRef pour les refs
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size })}
        {...props}
      />
    )
  }
)

// ✅ Props extensibles avec spread
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
}

export const Card = ({ variant = 'default', ...props }) => (
  <div className={cardVariants({ variant })} {...props} />
)
```

---

## 📐 Système de Spacing

### Échelle de Spacing

```typescript
// Configuration Tailwind spacing
const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px (base)
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
}

// Usage recommandé par contexte
const spacingGuide = {
  // Espacement interne des composants
  componentPadding: {
    sm: 'p-2',      // 8px - Badges, petits boutons
    default: 'p-4', // 16px - Cartes, formulaires
    lg: 'p-6',      // 24px - Sections importantes
    xl: 'p-8',      // 32px - Containers principaux
  },
  
  // Espacement entre éléments
  componentGap: {
    tight: 'gap-2',    // 8px - Éléments liés
    default: 'gap-4',  // 16px - Éléments standards
    loose: 'gap-8',    // 32px - Sections distinctes
    section: 'gap-16', // 64px - Séparation majeure
  },
  
  // Marges externes
  componentMargin: {
    sm: 'mb-2',      // 8px
    default: 'mb-4', // 16px
    lg: 'mb-8',      // 32px
    xl: 'mb-16',     // 64px
  }
}
```

---

## 🖼️ Système d'Images et Médias

### Composant Image Optimisé

```typescript
// components/common/OptimizedImage.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2'
  objectFit?: 'cover' | 'contain' | 'fill'
  priority?: boolean
  className?: string
  fallback?: string
}

export const OptimizedImage = ({
  src,
  alt,
  width = 400,
  height = 300,
  aspectRatio = '4/3',
  objectFit = 'cover',
  priority = false,
  className,
  fallback = '/images/placeholder.jpg'
}: OptimizedImageProps) => {
  const aspectRatioClasses = {
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  }
  
  const objectFitClasses = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
  }
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg bg-muted',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <Image
        src={src || fallback}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'h-full w-full transition-transform hover:scale-105',
          objectFitClasses[objectFit]
        )}
        onError={(e) => {
          if (fallback && e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback
          }
        }}
      />
    </div>
  )
}

// components/common/ImageGallery.tsx
export const ImageGallery = ({ images, ...props }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  return (
    <div className="space-y-4">
      {/* Image principale */}
      <OptimizedImage
        src={images[selectedIndex]?.url}
        alt={images[selectedIndex]?.alt}
        aspectRatio="16/9"
        className="w-full"
        priority
      />
      
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
              index === selectedIndex 
                ? "border-primary" 
                : "border-transparent hover:border-muted-foreground"
            )}
          >
            <OptimizedImage
              src={image.url}
              alt={image.alt}
              width={80}
              height={80}
              aspectRatio="square"
              className="w-16 h-16"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## ♿ Accessibilité

### Standards ARIA

```typescript
// components/common/AccessibleModal.tsx
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: ModalProps) => {
  const titleId = useId()
  const descriptionId = useId()
  
  // Focus trap
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const previousFocus = document.activeElement as HTMLElement
      
      return () => {
        document.body.style.overflow = ''
        previousFocus?.focus()
      }
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg rounded-lg border max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer la modal"
            className="p-2 hover:bg-muted rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div id={descriptionId}>
          {children}
        </div>
      </div>
    </div>
  )
}

// components/common/AccessibleButton.tsx
export const AccessibleButton = ({
  children,
  loading,
  disabled,
  ariaLabel,
  ...props
}: ButtonProps) => {
  return (
    <button
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        props.className
      )}
      {...props}
    >
      {loading && (
        <span className="sr-only">Chargement en cours</span>
      )}
      {children}
    </button>
  )
}
```

### Contraste et Lisibilité

```css
/* Respecter les ratios WCAG AAA */
:root {
  /* Ratio 7:1 minimum pour AAA */
  --foreground: 240 10% 3.9%;      /* #0c0a09 */
  --background: 0 0% 100%;          /* #ffffff */
  
  /* Ratio 4.5:1 minimum pour AA */
  --muted-foreground: 215 16% 47%;  /* #64748b */
  
  /* Focus visible pour navigation clavier */
  --ring: 142 70% 49%;              /* Même que primary */
  --ring-offset: var(--background);
}

/* Classes d'accessibilité */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus visible pour tous les éléments interactifs */
.focus-visible {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

/* Réduction du mouvement pour les utilisateurs sensibles */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📚 Documentation des Composants

### Storybook Configuration

```typescript
// .storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  features: {
    buildStoriesJson: true
  }
}

// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant Button avec variantes multiples pour HerbisVeritas'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'nature', 'terre'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
    },
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Stories principales
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  }
}

export const Nature: Story = {
  args: {
    children: 'Ajouter au panier',
    variant: 'nature',
  }
}

export const Loading: Story = {
  args: {
    children: 'Traitement...',
    loading: true,
    variant: 'nature',
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="nature">Nature</Button>
      <Button variant="terre">Terre</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toutes les variantes de boutons disponibles'
      }
    }
  }
}
```

---

## 🚀 Optimisation des Performances

### Lazy Loading des Composants

```typescript
// Lazy loading avec React.lazy et Suspense
const ProductCard = lazy(() => import('@/components/common/ProductCard'))
const MarketMap = lazy(() => import('@/components/features/MarketMap'))

export const ProductGrid = ({ products }) => {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
            <ProductCard product={product} />
          </Suspense>
        ))}
      </div>
    </Suspense>
  )
}

// Skeleton components
const ProductCardSkeleton = () => (
  <Card>
    <div className="aspect-square bg-muted animate-pulse rounded-lg" />
    <CardContent className="pt-4">
      <div className="h-4 bg-muted animate-pulse rounded mb-2" />
      <div className="h-3 bg-muted animate-pulse rounded w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-muted animate-pulse rounded w-20" />
        <div className="h-8 bg-muted animate-pulse rounded w-16" />
      </div>
    </CardContent>
  </Card>
)
```

### Tree-shaking et Bundle Optimization

```typescript
// Imports sélectifs pour réduire le bundle
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// ✅ Import spécifique plutôt que global
import { formatPrice } from '@/lib/formatters'

// ❌ Éviter les imports globaux
// import * as utils from '@/lib/utils'

// Dynamic imports pour les fonctionnalités avancées
const ChartComponent = dynamic(
  () => import('@/components/charts/SalesChart'),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
  }
)

// Code splitting au niveau route
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'))
const UserProfile = dynamic(() => import('@/components/user/Profile'))
```

---

## 🎯 Migration et Évolution

### Plan de Migration v1 → v2

```typescript
// 1. Mapping des anciens composants
const componentMigrationMap = {
  'OldButton' → 'Button',
  'OldCard' → 'Card',
  'PrimaryButton' → 'Button variant="nature"',
  'SecondaryButton' → 'Button variant="outline"',
}

// 2. Codemods pour migration automatique
// scripts/migrate-components.js
const transform = (fileInfo, api) => {
  const j = api.jscodeshift
  
  return j(fileInfo.source)
    .find(j.JSXElement, {
      openingElement: { name: { name: 'OldButton' } }
    })
    .replaceWith(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('Button')),
        j.jsxClosingElement(j.jsxIdentifier('Button')),
        []
      )
    )
    .toSource()
}

// 3. Tests de régression pour s'assurer de la compatibilité
describe('Migration compatibility', () => {
  it('should render new Button like old OldButton', () => {
    const oldButtonRender = render(<OldButton>Test</OldButton>)
    const newButtonRender = render(<Button>Test</Button>)
    
    expect(newButtonRender.container.innerHTML).toMatchSnapshot()
  })
})
```

---

Ce design system complet fournit une base solide et évolutive pour HerbisVeritas V2, avec une attention particulière à l'accessibilité, aux performances, et à la maintenabilité du code.