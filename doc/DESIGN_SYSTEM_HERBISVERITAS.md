# Design System HerbisVeritas V2

## 📋 Vue d'ensemble

Le design system HerbisVeritas V2 est construit sur **Tailwind CSS + CSS Variables** pour un theming dynamique et une cohérence visuelle parfaite avec l'identité de marque.

### Architecture Technique

- **Base** : Tailwind CSS + shadcn/ui
- **Tokens** : CSS Variables (RGB format)
- **Theming** : Light/Dark mode avec persistence
- **Compatibilité** : Next.js 15 + TypeScript
- **Performance** : Zero-runtime, CSS variables uniquement

---

## 🎨 Palette de Couleurs

### 🌱 Primary - Vert Olivier
**Usage** : Couleur principale de marque, CTA primaires, navigation
**Symbolisme** : Nature, authenticité, tradition méditerranéenne

```css
--primary-50: 244 250 246   /* #f4faf6 */
--primary-100: 230 242 234  /* #e6f2ea */
--primary-200: 204 229 212  /* #cce5d4 */
--primary-300: 163 212 180  /* #a3d4b4 */
--primary-400: 107 185 140  /* #6bb98c */
--primary-500: 62 142 104   /* #3e8e68 - DEFAULT */
--primary-600: 50 111 82    /* #326f52 */
--primary-700: 39 87 65     /* #275741 */
--primary-800: 28 62 46     /* #1c3e2e */
--primary-900: 19 43 32     /* #132b20 */
```

### 🌸 Secondary - Lavande de Provence
**Usage** : Éléments secondaires, accents floraux, wellness
**Symbolisme** : Douceur, méditation, ancrage floral provençal

```css
--secondary-50: 250 248 252  /* #faf8fc */
--secondary-100: 242 234 253 /* #f2eafd */
--secondary-200: 225 212 250 /* #e1d4fa */
--secondary-300: 201 174 245 /* #c9aef5 */
--secondary-400: 160 122 232 /* #a07ae8 */
--secondary-500: 129 86 204  /* #8156cc - DEFAULT */
--secondary-600: 105 68 170  /* #6944aa */
--secondary-700: 82 53 134   /* #523586 */
--secondary-800: 58 36 95    /* #3a245f */
--secondary-900: 38 22 66    /* #261642 */
```

### ☀️ Accent - Soleil Méditerranéen
**Usage** : Call-to-action, promotions, éléments énergétiques
**Symbolisme** : Vitalité, énergie solaire, chaleur du Midi

```css
--accent-50: 255 249 240   /* #fff9f0 */
--accent-100: 255 239 217  /* #ffefd9 */
--accent-200: 255 219 168  /* #ffdba8 */
--accent-300: 255 190 112  /* #ffbe70 */
--accent-400: 255 155 56   /* #ff9b38 */
--accent-500: 249 116 22   /* #f97416 - DEFAULT */
--accent-600: 219 93 14    /* #db5d0e */
--accent-700: 180 69 10    /* #b4450a */
--accent-800: 125 45 7     /* #7d2d07 */
--accent-900: 77 26 3      /* #4d1a03 */
```

### 🌞 Couleurs Sémantiques

```css
--success: 74 222 128      /* #4ade80 - Vert tendre herbes fraîches */
--warning: 250 204 21      /* #facc15 - Jaune doré soleil */
--error: 220 38 38         /* #dc2626 - Rouge coquelicot méditerranéen */
--info: 14 165 233         /* #0ea5e9 - Bleu azur méditerranéen */
```

### 🪨 Neutral - Calcaire
**Usage** : Textes, arrière-plans, éléments de structure
**Symbolisme** : Sobriété, support visuel, pierre naturelle

```css
--neutral-50: 250 250 249   /* #fafaf9 */
--neutral-100: 245 245 244  /* #f5f5f4 */
--neutral-200: 231 229 228  /* #e7e5e4 */
--neutral-300: 214 211 209  /* #d6d3d1 */
--neutral-400: 168 162 158  /* #a8a29e */
--neutral-500: 120 113 108  /* #78716c */
--neutral-600: 87 83 78     /* #57534e */
--neutral-700: 68 64 60     /* #44403c */
--neutral-800: 41 37 36     /* #292524 */
--neutral-900: 28 25 23     /* #1c1917 */
```

---

## 🎯 Usage des Classes Tailwind

### Classes HerbisVeritas Spécifiques

```tsx
// Couleurs avec opacité
<div className="bg-hv-primary text-white" />
<div className="bg-hv-primary/20 border-hv-primary" />
<div className="text-hv-secondary-600" />

// Scales complètes disponibles
<div className="bg-hv-primary-50" />  // Très clair
<div className="bg-hv-primary-500" /> // DEFAULT
<div className="bg-hv-primary-900" /> // Très foncé

// Couleurs sémantiques
<div className="bg-hv-success text-white" />
<div className="text-hv-error border-hv-error" />
```

### Compatibility shadcn/ui

```tsx
// Classes shadcn/ui (utilisent les CSS variables HerbisVeritas)
<div className="bg-primary text-primary-foreground" />
<div className="bg-background text-foreground" />
<div className="border-border bg-card" />
```

---

## 🔘 Composants Button

### Variants HerbisVeritas

```tsx
import { Button } from '@/components/ui/button'

// Variants solides
<Button variant="hv-primary">Primary Action</Button>
<Button variant="hv-secondary">Secondary Action</Button>
<Button variant="hv-accent">Accent Action</Button>

// Variants outline
<Button variant="hv-primary-outline">Primary Outline</Button>
<Button variant="hv-secondary-outline">Secondary Outline</Button>
<Button variant="hv-accent-outline">Accent Outline</Button>

// Variants ghost
<Button variant="hv-primary-ghost">Primary Ghost</Button>
<Button variant="hv-secondary-ghost">Secondary Ghost</Button>
<Button variant="hv-accent-ghost">Accent Ghost</Button>

// Variants sémantiques
<Button variant="hv-success">Success</Button>
<Button variant="hv-warning">Warning</Button>
<Button variant="hv-error">Error</Button>
<Button variant="hv-info">Info</Button>

// Variants standards (compatibilité)
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

---

## 🌗 Theme System

### Hook useTheme

```tsx
import { useTheme } from '@/hooks/use-theme'

function MyComponent() {
  const { 
    theme,        // 'light' | 'dark'
    mounted,      // boolean - hydration safe
    toggleTheme,  // () => void
    setTheme,     // (theme: 'light' | 'dark') => void
    resetToSystem, // () => void
    isDark,       // boolean
    isLight       // boolean
  } = useTheme()

  return (
    <div>
      <p>Theme actuel: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Mode Sombre</button>
      <button onClick={resetToSystem}>Réinitialiser au système</button>
    </div>
  )
}
```

### Composants Theme Switcher

```tsx
import { ThemeSwitcher, SimpleThemeToggle } from '@/components/theme/theme-switcher'

// Dropdown complet (desktop)
<ThemeSwitcher />

// Toggle simple (mobile)
<SimpleThemeToggle />
```

---

## 🎨 Dark Mode

### Adaptation Automatique des Couleurs

Le système adapte automatiquement les couleurs en mode sombre :

**Light Mode :**
- Background : `--neutral-50` (presque blanc)
- Foreground : `--neutral-900` (presque noir)
- Primary : `--primary-500` (vert olivier standard)

**Dark Mode :**
- Background : `--neutral-900` (presque noir)
- Foreground : `--neutral-50` (presque blanc)
- Primary : `--primary-400` (vert olivier plus clair)

### Personnalisation Dark Mode

```css
/* Dans src/styles/index.css */
.dark {
  --background: var(--neutral-900);
  --foreground: var(--neutral-50);
  --primary: var(--primary-400);    /* Plus clair en dark */
  --secondary: var(--secondary-300); /* Plus clair en dark */
  --accent: var(--accent-400);       /* Plus clair en dark */
}
```

---

## 🛠️ Configuration Technique

### Installation des Dépendances

```bash
# Déjà installés dans HerbisVeritas V2
npm install tailwindcss class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-dropdown-menu
```

### Structure des Fichiers

```
src/
├── styles/
│   └── index.css                 # CSS Variables + @layer base (Playfair + Montserrat)
├── hooks/
│   └── use-theme.ts             # Hook theme management
├── components/
│   ├── ui/
│   │   ├── button.tsx           # Button avec variants HV
│   │   └── typography.tsx       # Composants typographiques HerbisVeritas
│   ├── theme/
│   │   └── theme-switcher.tsx   # Composants switch theme
│   └── demo/
│       ├── color-showcase.tsx   # Demo couleurs design system
│       └── typography-showcase.tsx # Demo typographie complète
└── lib/
    └── utils.ts                 # cn() helper function
```

### Configuration Tailwind

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // HerbisVeritas Brand Colors
        'hv-primary': {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)', // DEFAULT
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-500) / <alpha-value>)',
        },
        // ... autres couleurs
        
        // shadcn/ui compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
      }
    }
  }
}
```

---

## 📐 Guidelines d'Usage

### Hiérarchie des Couleurs

1. **Primary (Vert Olivier)** : Actions principales, navigation, titres importants
2. **Secondary (Lavande)** : Actions secondaires, éléments wellness, ambiance
3. **Accent (Soleil)** : Promotions, urgence, call-to-action énergétiques
4. **Neutral (Calcaire)** : Textes, arrière-plans, éléments structurels

### Règles de Contraste

- **Texte sur Primary 500+** : Toujours blanc (`text-white`)
- **Texte sur Primary 50-400** : Noir ou neutre foncé (`text-hv-neutral-900`)
- **Liens** : `text-hv-primary hover:text-hv-primary-700`
- **Bordures subtiles** : `border-hv-neutral-200 dark:border-hv-neutral-700`

### Combinaisons Recommandées

```tsx
// Hero sections
<div className="bg-hv-primary-50 text-hv-primary-900">

// Cards produits
<div className="bg-white border-hv-neutral-200 hover:border-hv-primary-200">

// Badges/Labels
<div className="bg-hv-secondary-100 text-hv-secondary-700">

// Alertes/Notifications
<div className="bg-hv-success/10 border-hv-success text-hv-success-800">
```

---

## 🚀 Extensibilité Future

### Ajout de Nouvelles Couleurs

1. **Définir les CSS Variables** dans `src/styles/index.css`
2. **Ajouter les classes Tailwind** dans `tailwind.config.ts`
3. **Créer les variants Button** si nécessaire
4. **Mettre à jour cette documentation**

### Ajout de Nouveaux Composants

Suivre le pattern des variants existants :

```tsx
const componentVariants = cva("base-classes", {
  variants: {
    variant: {
      "hv-primary": "bg-hv-primary text-white hover:bg-hv-primary-600",
      "hv-secondary": "bg-hv-secondary text-white hover:bg-hv-secondary-600",
      // ...
    }
  }
})
```

---

## 📊 Performance

### Avantages CSS Variables

- **Bundle size** : Aucun impact, variables CSS natives
- **Runtime** : Zero-runtime, changement instantané
- **Caching** : CSS statique mis en cache par CDN
- **SSR** : Compatible server-side rendering
- **Hydration** : Pas de flash de couleurs incorrectes

### Métriques Cibles

- **First Contentful Paint** : < 1.2s
- **Largest Contentful Paint** : < 2.5s
- **Cumulative Layout Shift** : < 0.1
- **Bundle CSS** : < 50kb gzipped

---

## 🎯 Checklist d'Usage

### Pour Développeurs

- [ ] Utiliser `hv-primary`, `hv-secondary`, `hv-accent` pour les couleurs de marque
- [ ] Privilégier les variants Button HerbisVeritas (`hv-primary` vs `default`)
- [ ] Tester en mode light ET dark
- [ ] Vérifier le contraste (min 4.5:1 pour texte normal)
- [ ] Utiliser les couleurs sémantiques pour les états (`hv-success`, `hv-error`)

### Pour Designers

- [ ] Respecter la hiérarchie des couleurs Primary > Secondary > Accent
- [ ] Utiliser Neutral pour 80% des textes et arrière-plans
- [ ] Éviter plus de 3 couleurs par écran (sauf cas spéciaux)
- [ ] Prévoir les adaptations dark mode dès la conception
- [ ] Valider l'accessibilité avec les outils de contraste

### Pour Typographie HerbisVeritas

- [ ] **Playfair Display** uniquement pour H1-H2 (éviter surcharge)
- [ ] **Montserrat** pour tout le reste (interface, corps de texte)
- [ ] **Hiérarchie respectée** : H1 hero → H6 tags sans sauts
- [ ] **Contraste minimum 4.5:1** pour le texte standard
- [ ] **Responsive automatique** : utiliser les tokens clamp() existants
- [ ] **Poids cohérents** : Regular (400) → Medium (500) → SemiBold (600) → Bold (700)
- [ ] **Citations en Playfair Italic** pour l'élégance éditoriale
- [ ] **Labels en Montserrat Bold** avec uppercase et letter-spacing

---

## 🧱 Tokens d'Espacement (Standards 2025)

### Échelle Base 4px

```css
--space-2xs: 4px;    /* 1 Tailwind unit */
--space-xs:  8px;    /* 2 */
--space-sm:  12px;   /* 3 */
--space-md:  16px;   /* 4 */
--space-lg:  24px;   /* 6 */
--space-xl:  32px;   /* 8 */
--space-2xl: 48px;   /* 12 */
--space-3xl: 64px;   /* 16 */
```

### Aliases UX Sémantiques

```css
--gap-card: var(--space-lg);         /* 24px - espacement entre cartes */
--gap-section: var(--space-2xl);     /* 48px - espacement entre sections */
--pad-card: var(--space-lg);         /* 24px - padding interne cartes */
--pad-page: var(--space-2xl);        /* 48px - padding pages */
```

### Usage Tailwind

```tsx
// Espacement standard
<div className="p-lg gap-md">          // padding 24px, gap 16px
<div className="space-y-xl">           // vertical spacing 32px

// Espacement sémantique
<div className="p-card-pad">           // padding carte 24px
<div className="space-y-section-gap">  // espacement section 48px
```

---

## 🔤 Tokens Typographiques HerbisVeritas

### Familles de Polices (Mise à Jour 2025)

```css
--font-display: "Playfair Display", ui-serif, serif;        /* Titres H1-H2 élégants */
--font-sans: "Montserrat", system-ui, -apple-system, sans-serif; /* Corps de texte, interface */
--font-mono: ui-monospace, SFMono-Regular, monospace;       /* Code */
```

**Philosophie Typographique HerbisVeritas :**
- **Playfair Display** : Élégance éditoriale pour les titres principaux (H1-H2)
- **Montserrat** : Lisibilité optimale pour l'interface et le contenu

### Poids de Police

```css
--weight-regular: 400;    /* Corps de texte normal */
--weight-medium: 500;     /* Emphase légère */
--weight-semibold: 600;   /* Sous-titres */
--weight-bold: 700;       /* Titres principaux */
```

### Hiérarchie Typographique HerbisVeritas

| Élément | Police | Taille (desktop) | Taille (mobile) | Usage Spécifique |
|---------|--------|------------------|-----------------|------------------|
| **H1** | Playfair Display Bold | 64px | 40px | Hero, titres pages principales |
| **H2** | Playfair Display SemiBold | 40px | 28px | Sections majeures, catégories produits |
| **H3** | Montserrat Medium | 28px | 22px | Sous-sections, blocs secondaires |
| **H4** | Montserrat Medium | 22px | 18px | Titres cartes produit, sous-titres article |
| **H5** | Montserrat SemiBold | 18px | 16px | Labels ("Ingrédients", "Témoignages") |
| **H6** | Montserrat Bold | 16px | 14px | Petits titres, encarts, tags |

### Tailles Fluides avec clamp() (Responsive Automatique)

```css
/* Tailles fluides selon hiérarchie HerbisVeritas */
--fs-xs:  clamp(.78rem, .72rem + .2vw, .85rem);     /* ~12-14px - H6, tags, labels */
--fs-sm:  clamp(.88rem, .82rem + .2vw, .95rem);     /* ~14-15px - petits paragraphes, légendes */
--fs-md:  clamp(1rem,   .95rem + .3vw, 1.125rem);   /* ~16-18px - paragraphe standard, H5 */
--fs-lg:  clamp(1.125rem, 1.02rem + .6vw, 1.375rem); /* ~18-22px - H4, titres cartes produit */
--fs-xl:  clamp(1.375rem, 1.2rem + .8vw, 1.75rem);  /* ~22-28px - H3, sous-sections */
--fs-2xl: clamp(1.75rem, 1.5rem + 1vw,  2.25rem);   /* ~28-36px - H2 sections majeures */
--fs-3xl: clamp(2.25rem, 1.8rem + 1.6vw, 3rem);     /* ~36-48px - H1 Hero, titres principaux */
--fs-4xl: clamp(2.5rem, 2rem + 2.5vw, 4rem);        /* ~40-64px - H1 desktop hero */
```

### Composants Typographiques React

Le design system inclut des composants React prêts à l'emploi avec toutes les variantes :

```tsx
import { Heading, Text, Quote, Slogan, Label, Link } from '@/components/ui/typography'

// Hiérarchie des titres avec variantes
<Heading level="h1" variant="primary">Titre Principal HerbisVeritas</Heading>
<Heading level="h2" variant="secondary">Section Lavande</Heading>
<Heading level="h3">Sous-section Standard</Heading>

// Texte avec tailles et variantes
<Text size="lg" weight="medium" variant="primary">Texte d'introduction important</Text>
<Text>Paragraphe standard Montserrat 16-18px</Text>
<Text size="sm" variant="muted">Légende discrète</Text>

// Citations élégantes Playfair Display
<Quote size="large" variant="primary">
  "La beauté naturelle révèle l'essence authentique de chaque être."
</Quote>

// Slogans & Punchlines avec gradients
<Slogan variant="gradient" size="hero">L'Authentique Beauté Naturelle</Slogan>
<Slogan variant="primary" size="large">Révélez Votre Éclat Naturel</Slogan>

// Labels & Tags e-commerce
<Label variant="primary">Bio Certifié</Label>
<Label variant="accent">Promo -20%</Label>
<Label size="xs" variant="success" rounded="full">Nouveau</Label>

// Liens avec états hover
<Link variant="default" href="#">Lien primary par défaut</Link>
<Link variant="secondary" href="#">Lien lavande</Link>
<Link variant="accent" href="#">Lien soleil méditerranéen</Link>
```

### Usage Tailwind Classes Directes

```tsx
// Familles HerbisVeritas
<h1 className="font-display text-4xl font-bold">Hero Playfair Display</h1>
<h2 className="font-display text-2xl font-semibold">Section Playfair Display</h2>
<h3 className="font-sans text-xl font-medium">Sous-section Montserrat</h3>
<p className="font-sans text-base">Corps de texte Montserrat</p>
<code className="font-mono text-sm">Code monospace</code>

// Poids typographiques
<span className="font-regular">Montserrat Regular (400)</span>
<span className="font-medium">Montserrat Medium (500)</span>  
<span className="font-semibold">Montserrat SemiBold (600)</span>
<span className="font-bold">Montserrat Bold (700)</span>

// Tailles responsive automatiques
<h1 className="text-4xl">H1 Hero (40px → 64px)</h1>
<h2 className="text-2xl">H2 Sections (28px → 40px)</h2>
<h3 className="text-xl">H3 Sous-sections (22px → 28px)</h3>
<p className="text-base">Paragraphe standard (16px → 18px)</p>
```

---

## 🪞 Tokens d'Élévation

### Ombres & Focus

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,.06);              /* Cards légères */
--shadow-md: 0 6px 16px rgba(0,0,0,.10);             /* Cards principales */
--shadow-lg: 0 12px 28px rgba(0,0,0,.14);            /* Modales, overlays */
--ring-focus: 0 0 0 3px color-mix(in srgb, rgb(var(--primary-500)) 30%, transparent);
```

### Bordures

```css
--border-1: 1px;      /* Bordure standard */
--border-2: 2px;      /* Bordure emphase */
```

### Usage Tailwind

```tsx
// Élévation
<div className="shadow-sm">Carte légère</div>
<div className="shadow-md">Carte standard</div>  
<div className="shadow-lg">Modale/overlay</div>

// Focus states
<button className="focus:ring ring-ring">Button avec focus</button>

// Bordures
<div className="border border-hv-neutral-200">Bordure fine</div>
<div className="border-2 border-hv-primary">Bordure emphase</div>
```

---

## 🎛️ Tokens Motion (Framer Motion Ready)

### Durées d'Animation

```css
--dur-fast: 120ms;    /* Micro-interactions */
--dur-base: 200ms;    /* Transitions standard */
--dur-slow: 320ms;    /* Animations complexes */
```

### Courbes d'Animation

```css
--ease-standard: cubic-bezier(.2,.8,.2,1);    /* Transitions générales */
--ease-entrance: cubic-bezier(.16,1,.3,1);    /* Entrées d'éléments */
--ease-exit:     cubic-bezier(.4,0,1,1);      /* Sorties d'éléments */
```

### Usage Tailwind + Framer Motion

```tsx
// Transitions CSS
<div className="transition-all duration-base ease-standard">
  Element avec transition
</div>

// Framer Motion avec tokens
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--dur-base').replace('ms', '')) / 1000,
      ease: [0.2, 0.8, 0.2, 1] // --ease-standard
    }
  }
}
```

---

## 🌫️ Tokens Utilitaires

### Z-index Sémantiques

```css
--z-base: 0;       /* Éléments de base */
--z-header: 10;    /* Navigation */
--z-overlay: 40;   /* Overlays/dropdowns */
--z-modal: 50;     /* Modales */
--z-toast: 60;     /* Notifications */
```

### Opacités

```css
--opacity-disabled: .5;    /* États désactivés */
--opacity-dim: .75;        /* États estompés */
```

### Layout Containers

```css
--container-sm: 640px;     /* Mobile large */
--container-md: 768px;     /* Tablet */
--container-lg: 1024px;    /* Desktop */
--container-xl: 1280px;    /* Large desktop */
```

### Usage Tailwind

```tsx
// Z-index
<nav className="z-header">Navigation</nav>
<div className="z-modal">Modale</div>
<div className="z-toast">Toast notification</div>

// Opacités
<button disabled className="opacity-disabled">Disabled</button>
<div className="opacity-dim">Contenu estompé</div>

// Containers responsive
<div className="max-w-container-lg mx-auto">Contenu centré</div>
```

---

## 📱 Responsive & Breakpoints

### Breakpoints Tailwind (déjà configurés)

```css
sm: 640px   /* Mobile large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Typography Responsive Automatique

Grâce aux tokens `clamp()`, la typographie s'adapte automatiquement :

```tsx
// Ces classes s'adaptent automatiquement au viewport
<h1 className="text-3xl">Titre 36px → 48px automatique</h1>
<p className="text-base">Corps 16px → 18px automatique</p>

// Plus besoin de : sm:text-lg md:text-xl lg:text-2xl
// Remplacé par : text-xl (fluide automatique)
```

### Espacement Responsive avec Tokens

```tsx
// Espacement qui s'adapte naturellement
<section className="py-section-gap px-page-pad">
  <div className="space-y-card-gap">
    <div className="p-card-pad">Card content</div>
  </div>
</section>
```

---

## 📚 Références

- **Tailwind CSS Variables** : [Documentation officielle](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- **shadcn/ui Theming** : [Guide theming](https://ui.shadcn.com/docs/theming)
- **Contrast Guidelines** : [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- **CSS Variables Support** : [Can I Use](https://caniuse.com/css-variables)

---

**Version** : 1.0.0  
**Dernière MAJ** : 2025-01-28  
**Statut** : ✅ Production Ready