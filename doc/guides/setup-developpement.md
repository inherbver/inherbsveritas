# Setup Développement

## Prérequis

- Node.js 18+
- Git configuré
- Compte Supabase

## Installation

```bash
# Clone et setup
git clone <repository>
cd inherbisveritas
npm install

# Configuration
cp .env.local.example .env.local
# Modifier variables Supabase dans .env.local

# Base de données
npm run db:reset
npm run db:seed

# Démarrage
npm run dev
```

## Configuration Environnement

### Variables Essentielles
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mntndpelpvcskirnyqvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=<random_secret>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe_pub>
STRIPE_SECRET_KEY=<stripe_secret>
```

### Structure Projet
```
inherbisveritas/
├── app/                    # Pages Next.js 15
├── src/
│   ├── components/         # Composants UI/Business
│   ├── lib/               # Utils/Helpers
│   └── types/             # TypeScript types
├── supabase/
│   └── migrations/        # Schema SQL
├── tests/                 # Tests TDD
├── doc/                   # Documentation finale
└── docs/                  # Documentation développement
```

## Développement

### Commandes Essentielles
```bash
# Développement
npm run dev              # Serveur développement
npm run build           # Build production
npm run start           # Serveur production

# Tests TDD
npm run test:unit       # Tests unitaires
npm run test:integration # Tests intégration
npm run test:e2e        # Tests end-to-end

# Qualité
npm run lint            # Vérification code
npm run typecheck       # Validation TypeScript

# Base de données
npm run db:reset        # Reset + migration
npm run db:seed         # Données test
```

### Workflow TDD
1. Écrire test qui échoue
2. Implémenter minimum pour passer test
3. Refactoriser en conservant tests verts
4. Valider couverture > 80 pourcent

## Débogage

### Logs Supabase
```bash
# Logs API
npx supabase logs api

# Logs base de données
npx supabase logs postgres
```

### Variables Debug
```bash
# Mode développement
NODE_ENV=development
DEBUG=true
```