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
│   └── index.css                 # CSS Variables + @layer base
├── hooks/
│   └── use-theme.ts             # Hook theme management
├── components/
│   ├── ui/
│   │   └── button.tsx           # Button avec variants HV
│   ├── theme/
│   │   └── theme-switcher.tsx   # Composants switch theme
│   └── demo/
│       └── color-showcase.tsx   # Demo design system
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