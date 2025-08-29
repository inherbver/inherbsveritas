# HerbisVeritas V2 - Guide de Configuration Développement

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète de l'environnement de développement pour HerbisVeritas V2, basé sur Next.js 15, Supabase et TypeScript.

---

## 🛠️ Prérequis Système

### Versions Recommandées
```bash
Node.js: 18.17.0+ (LTS recommandé)
npm: 9.0.0+
Git: 2.34.0+
VSCode: 1.80.0+ (IDE recommandé)
```

### Vérification des versions
```bash
node --version    # v18.17.0+
npm --version     # 9.0.0+
git --version     # 2.34.0+
```

### Installation Node.js
```bash
# Via nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Via site officiel
# https://nodejs.org/fr/download/
```

---

## 🚀 Setup Initial du Projet

### 1. Clone et Installation
```bash
# Clone du repository
git clone https://github.com/votre-org/herbisveritas-v2.git
cd herbisveritas-v2

# Installation des dépendances
npm install

# Vérification de l'installation
npm run lint
```

### 2. Configuration des Variables d'Environnement

#### Fichier `.env.local` (créer à la racine)
```env
# Application
NEXT_PUBLIC_APP_NAME="HerbisVeritas"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Supabase (Configuration locale)
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe (Clés de test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend - optionnel pour dev)
RESEND_API_KEY="re_..."

# Analytics (optionnel pour dev)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."

# Debug et Logs
DEBUG="herbisveritas:*"
LOG_LEVEL="debug"
```

#### Sécurisation du fichier
```bash
# Ajouter à .gitignore (déjà fait normalement)
echo ".env.local" >> .gitignore
chmod 600 .env.local
```

### 3. Configuration Supabase Locale

#### Installation Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows (via scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

#### Setup projet Supabase local
```bash
# Login Supabase
supabase login

# Link au projet distant
supabase link --project-ref votre-project-ref

# Pull du schéma distant (si existant)
supabase db pull

# Démarrage local (optionnel pour dev full-local)
supabase start
```

---

## 💻 Configuration IDE (VS Code)

### Extensions Recommandées

#### Extensions Essentielles
```json
// .vscode/extensions.json (auto-installées)
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "supabase.supabase-vscode"
  ]
}
```

### Configuration Workspace

#### `.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### `.vscode/launch.json` (Debugging)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Snippets TypeScript personnalisés
```json
// .vscode/typescript.json
{
  "Server Component": {
    "prefix": "sc",
    "body": [
      "interface ${1:Component}Props {",
      "  ${2:// props}",
      "}",
      "",
      "export default function ${1:Component}({ ${3:} }: ${1:Component}Props) {",
      "  return (",
      "    <div>${4:// content}</div>",
      "  )",
      "}"
    ]
  },
  "Server Action": {
    "prefix": "sa",
    "body": [
      "'use server'",
      "",
      "import { ${1:Schema} } from '@/lib/validators/${2:schema}'",
      "import { createServerClient } from '@/lib/supabase/server'",
      "",
      "export async function ${3:actionName}(formData: FormData) {",
      "  const supabase = createServerClient()",
      "  const data = ${1:Schema}.parse({",
      "    ${4:// parse formData}",
      "  })",
      "  ",
      "  const { error } = await supabase",
      "    .from('${5:table}')",
      "    .insert(data)",
      "  ",
      "  if (error) throw error",
      "  ",
      "  revalidatePath('${6:path}')",
      "}"
    ]
  }
}
```

---

## 🎯 Scripts npm Disponibles

### Scripts de Développement
```bash
# Démarrage serveur de développement
npm run dev          # http://localhost:3000

# Build de production
npm run build        # Génère .next/

# Démarrage production locale
npm run start        # Nécessite npm run build avant

# Preview de production
npm run preview      # Build + start en une commande
```

### Scripts de Qualité
```bash
# Linting et formatage
npm run lint         # ESLint avec auto-fix
npm run lint:check   # ESLint sans fix (pour CI)
npm run prettier     # Format tous les fichiers
npm run typecheck    # Vérification TypeScript

# Script de qualité complet
npm run quality      # lint + typecheck + tests
```

### Scripts de Test
```bash
# Tests unitaires
npm run test         # Jest en mode watch
npm run test:ci      # Jest pour CI (single run)
npm run test:coverage # Coverage report

# Tests E2E
npm run test:e2e     # Playwright tests
npm run test:e2e:ui  # Playwright avec UI
npm run test:e2e:debug # Playwright en mode debug
```

### Scripts Base de Données
```bash
# Supabase local
npm run db:start     # Démarre conteneurs locaux
npm run db:stop      # Arrête conteneurs
npm run db:reset     # Reset DB locale
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed avec données de test

# Utilitaires
npm run db:types     # Génère types TypeScript depuis DB
npm run db:diff      # Diff entre local et distant
```

### Scripts Utilitaires
```bash
# Génération
npm run generate:component  # Crée nouveau composant
npm run generate:page      # Crée nouvelle page
npm run generate:action    # Crée server action

# Nettoyage
npm run clean        # Nettoie .next, node_modules/.cache
npm run fresh-install # Clean + reinstall complet

# Analyse
npm run analyze      # Bundle analyzer
npm run audit        # Audit sécurité dépendances
```

---

## 🗂️ Structure du Projet

### Architecture des Dossiers
```
herbisveritas-v2/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 [locale]/          # Pages i18n
│   │   │   ├── 📁 (auth)/        # Route groups
│   │   │   ├── 📁 admin/         # Pages admin
│   │   │   └── 📁 shop/          # Pages boutique
│   │   ├── 📄 globals.css        # Styles globaux
│   │   ├── 📄 layout.tsx         # Root layout
│   │   └── 📄 not-found.tsx      # Page 404
│   ├── 📁 actions/                # Server Actions
│   │   ├── 📄 auth.ts            # Actions auth
│   │   ├── 📄 products.ts        # Actions produits
│   │   └── 📄 orders.ts          # Actions commandes
│   ├── 📁 components/             # Composants React
│   │   ├── 📁 ui/                # shadcn/ui components
│   │   ├── 📁 common/            # Composants réutilisables
│   │   ├── 📁 forms/             # Formulaires
│   │   ├── 📁 layout/            # Layout components
│   │   └── 📁 features/          # Feature components
│   ├── 📁 lib/                   # Utilitaires et config
│   │   ├── 📁 supabase/          # Configuration Supabase
│   │   ├── 📁 validators/        # Schémas Zod
│   │   ├── 📁 utils/             # Fonctions utilitaires
│   │   └── 📁 auth/              # Utilitaires auth
│   ├── 📁 stores/                # Zustand stores
│   │   ├── 📄 cart.ts            # Store panier
│   │   └── 📄 auth.ts            # Store auth
│   ├── 📁 types/                 # Types TypeScript
│   │   ├── 📄 database.ts        # Types Supabase
│   │   ├── 📄 api.ts             # Types API
│   │   └── 📄 global.ts          # Types globaux
│   ├── 📁 i18n/                  # Internationalisation
│   │   ├── 📁 messages/          # Traductions
│   │   └── 📄 navigation.ts      # Navigation i18n
│   └── 📄 middleware.ts          # Next.js middleware
├── 📁 public/                    # Assets statiques
│   ├── 📁 images/               # Images
│   ├── 📁 icons/                # Icônes
│   └── 📁 locales/              # Assets i18n
├── 📁 docs/                     # Documentation
├── 📁 tests/                    # Configuration tests
│   ├── 📄 setup.ts             # Setup Jest
│   └── 📁 __mocks__/           # Mocks globaux
├── 📁 .github/                 # GitHub workflows
├── 📄 package.json            # Dépendances npm
├── 📄 tsconfig.json           # Config TypeScript
├── 📄 tailwind.config.js      # Config Tailwind
├── 📄 next.config.js          # Config Next.js
├── 📄 jest.config.js          # Config Jest
├── 📄 playwright.config.ts    # Config Playwright
└── 📄 .env.local             # Variables environnement
```

### Conventions de Nommage
```bash
# Fichiers et dossiers
kebab-case/           # Dossiers
PascalCase.tsx        # Composants React
camelCase.ts          # Utilitaires et actions
SCREAMING_SNAKE_CASE  # Constantes

# Variables et fonctions
camelCase             # Variables et fonctions
PascalCase            # Composants et types
SCREAMING_SNAKE_CASE  # Constantes d'environnement

# Database
snake_case            # Tables et colonnes (Supabase)
```

---

## 🧪 Configuration des Tests

### Jest (Tests Unitaires)

#### Installation des dépendances de test
```bash
# Déjà incluses dans package.json
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  jest-environment-jsdom
```

#### Configuration Jest (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### Setup des tests (`tests/setup.ts`)
```typescript
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills pour les tests
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock des modules externes
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}))
```

### Playwright (Tests E2E)

#### Configuration Playwright (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🔧 Workflows de Développement

### Workflow Git Recommandé

#### Structure des branches
```bash
main              # Production stable
develop           # Intégration continue  
feature/US-XXX    # Features par US
hotfix/bug-fix    # Corrections urgentes
release/v2.1.0    # Préparations releases
```

#### Commandes Git usuelles
```bash
# Nouvelle feature
git checkout develop
git pull origin develop
git checkout -b feature/US-001-product-search
git add .
git commit -m "feat(search): implement product search functionality"
git push origin feature/US-001-product-search

# Merge request via interface GitHub/GitLab
```

### Workflow de Développement Quotidien

#### Routine matinale
```bash
# Mise à jour du projet
git checkout develop
git pull origin develop
npm install  # Si package.json a changé

# Mise à jour types DB si changements
npm run db:types

# Démarrage environnement
npm run dev  # Terminal 1
npm run test  # Terminal 2 (optionnel)
```

#### Avant commit
```bash
# Vérifications qualité
npm run quality  # lint + typecheck + tests

# Tests E2E sur feature critique
npm run test:e2e -- --grep "checkout"

# Commit avec format conventionnel
git add .
git commit -m "feat(cart): add persistent cart functionality"
```

#### Avant merge request
```bash
# Rebase sur develop
git checkout develop
git pull origin develop
git checkout feature/ma-branche
git rebase develop

# Tests complets
npm run test:ci
npm run test:e2e
npm run build

# Push force après rebase
git push origin feature/ma-branche --force-with-lease
```

---

## 🐛 Troubleshooting Courant

### Problèmes Node.js / npm

#### "Module not found" après npm install
```bash
# Nettoyer et réinstaller
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### Erreurs de versions Node.js
```bash
# Vérifier version
node --version  # doit être 18.17.0+

# Switcher avec nvm
nvm use 18.17.0
```

### Problèmes Next.js

#### Page blanche ou erreurs hydration
```bash
# Nettoyer cache Next.js
rm -rf .next
npm run dev
```

#### Erreurs de build TypeScript
```bash
# Vérification TypeScript isolée
npm run typecheck
npx tsc --noEmit
```

### Problèmes Supabase

#### Erreurs de connexion Supabase
```bash
# Vérifier variables d'environnement
cat .env.local | grep SUPABASE

# Tester connexion
supabase projects list
supabase db pull --dry-run
```

#### Types Supabase obsolètes
```bash
# Régénérer les types
npm run db:types
# ou
supabase gen types typescript --local > src/types/database.ts
```

### Problèmes de Performance

#### Build lent
```bash
# Analyser le bundle
npm run analyze

# Vérifier cache
rm -rf .next/cache
npm run build
```

#### Tests lents
```bash
# Tests en parallèle
npm run test -- --maxWorkers=4

# Tests spécifiques
npm run test -- --testPathPattern=components
```

---

## 📚 Ressources et Documentation

### Documentation Officielle
- [Next.js 15](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Playwright](https://playwright.dev/docs/intro)

### Outils de Développement
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com/test)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Actions](https://github.com/features/actions)

### Extensions VS Code Utiles
- Thunder Client (API testing)
- GitLens (Git insights)
- Auto Rename Tag
- Bracket Pair Colorizer
- Error Lens

### Communauté et Support
- [HerbisVeritas Slack](https://herbisveritas.slack.com) (équipe interne)
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🎯 Prochaines Étapes

Une fois votre environnement configuré :

1. ✅ **Vérifier l'installation** avec `npm run quality`
2. ✅ **Lancer les tests** avec `npm run test:ci`
3. ✅ **Créer votre première branche** `feature/setup-complete`
4. ✅ **Explorer la codebase** en commençant par `src/app`
5. ✅ **Lire la documentation** des User Stories et PRD

### Premier développement recommandé
```bash
# Créer un composant simple pour tester
npm run generate:component HelloWorld
# Modifier src/app/[locale]/page.tsx
# Tester en local
npm run dev
```

---

**🚀 Bon développement sur HerbisVeritas V2 !**

Pour toute question technique, consultez d'abord cette documentation, puis contactez l'équipe via Slack `#dev-herbisveritas-v2`.