# Guide de Déploiement - HerbisVeritas V2

## 📋 Vue d'ensemble

Ce guide détaille le processus complet de déploiement d'HerbisVeritas V2 en production, utilisant l'architecture Next.js 15 + Supabase + Vercel pour une solution moderne, performante et scalable.

## 🏗️ Architecture de Déploiement

### Stack Technologique de Production

```mermaid
graph TB
    A[Vercel Edge Network] --> B[Next.js 15 App]
    B --> C[Supabase Production]
    
    C --> D[PostgreSQL RLS]
    C --> E[Auth & Storage]
    C --> F[Realtime]
    
    B --> G[Stripe Webhooks]
    B --> H[Email Services]
    
    I[GitHub Repository] --> J[Vercel CI/CD]
    J --> A
    
    K[Supabase CLI] --> C
```

### Environnements de Déploiement

| Environnement | Branche Git | URL | Base de données |
|---------------|-------------|-----|------------------|
| **Production** | `main` | `herbisveritas.fr` | Production Supabase |
| **Staging** | `develop` | `staging.herbisveritas.fr` | Staging Supabase |
| **Preview** | `feature/*` | `*.vercel.app` | Staging Supabase |

## ⚙️ Configuration Supabase

### 1. Création du Projet Production

```bash
# Créer un nouveau projet Supabase
supabase projects create herbisveritas-production --org-id="your-org-id"

# Récupérer l'ID du projet
supabase projects list
```

### 2. Configuration des Environnements

```bash
# Variables d'environnement essentielles
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SECRET_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_JWT_SECRET="your-jwt-secret"
SUPABASE_DB_PASSWORD="your-secure-password"
```

### 3. Migration des Schémas et Données

```bash
# Lier le projet local au projet production
supabase link --project-ref your-production-project-id

# Appliquer les migrations
supabase db push

# Déployer les fonctions Edge
supabase functions deploy --project-ref your-production-project-id

# Configurer les secrets de production
supabase secrets set --env-file .env.production
```

### 4. Configuration des Politiques RLS

```sql
-- Activer RLS sur toutes les tables sensibles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Politique pour les profils utilisateur
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Politique pour les commandes
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Politique admin pour gestion complète
CREATE POLICY "Admins have full access" 
ON profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

### 5. Configuration Auth Production

```toml
# supabase/config.toml
[auth]
site_url = "https://herbisveritas.fr"
additional_redirect_urls = [
  "https://staging.herbisveritas.fr",
  "https://herbisveritas-git-*.vercel.app"
]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.external.github]
enabled = false  # Désactivé selon les specs

# Pas d'OAuth - email uniquement
```

## 🚀 Configuration Vercel

### 1. Connexion du Repository

```bash
# Installer Vercel CLI
npm i -g vercel

# Lier le projet
vercel link

# Configuration automatique du projet
vercel --prod
```

### 2. Variables d'Environnement Vercel

```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Configuration
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@mg.herbisveritas.fr"
SMTP_PASS="your-smtp-password"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://herbisveritas.fr"
```

### 3. Configuration next.config.js Production

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'your-project-ref.supabase.co',
      'images.unsplash.com'
    ],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Internationalization
  i18n: {
    locales: ['fr', 'en', 'de', 'es'],
    defaultLocale: 'fr',
    localeDetection: true
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com;"
          }
        ]
      }
    ]
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
```

## 🔧 Processus de Build et Déploiement

### 1. Pipeline CI/CD Automatisé

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test
      
    - name: Type check
      run: npm run typecheck
      
    - name: Lint
      run: npm run lint
      
    - name: Build
      run: npm run build
      
    - name: Deploy Database Migrations
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        SUPABASE_DB_PASSWORD: ${{ secrets.PRODUCTION_DB_PASSWORD }}
        SUPABASE_PROJECT_ID: ${{ secrets.PRODUCTION_PROJECT_ID }}
      run: |
        npx supabase link --project-ref $SUPABASE_PROJECT_ID
        npx supabase db push
        
    - name: Deploy to Vercel
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
        VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      run: |
        npx vercel --prod --token=$VERCEL_TOKEN
```

### 2. Scripts Package.json Production

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true npm run build",
    "deploy:production": "npm run build && vercel --prod",
    "deploy:staging": "npm run build && vercel",
    "db:migrate:production": "supabase db push --project-ref $SUPABASE_PRODUCTION_REF",
    "db:seed:production": "supabase seed run --project-ref $SUPABASE_PRODUCTION_REF",
    "functions:deploy": "supabase functions deploy --project-ref $SUPABASE_PRODUCTION_REF",
    "secrets:deploy": "supabase secrets set --env-file .env.production"
  }
}
```

### 3. Optimisations de Build

```javascript
// next.config.js - Optimisations avancées
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // Compression et minification
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Optimisation des chunks
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react',
      'date-fns',
      'zod'
    ]
  },
  
  // Code splitting avancé
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true
        }
      }
    }
    return config
  }
})
```

## 🔒 Configuration de Sécurité

### 1. Secrets et Variables d'Environnement

```bash
# Supabase Secrets (production)
supabase secrets set \
  STRIPE_SECRET_KEY="sk_live_..." \
  SMTP_PASSWORD="secure-password" \
  JWT_SECRET="your-jwt-secret" \
  WEBHOOK_SECRET="whsec_..." \
  OPENAI_API_KEY="sk-..." \
  --project-ref your-production-ref
```

### 2. Configuration Stripe Webhooks

```javascript
// api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!
  
  let event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }
  
  // Gérer les événements Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 3. Middleware de Sécurité

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Headers de sécurité
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Rate limiting basique
  const ip = request.ip ?? '127.0.0.1'
  
  // Authentification pour les routes protégées
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protection des routes admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*'
  ]
}
```

## 📊 Monitoring et Observabilité

### 1. Logging Structuré

```typescript
// lib/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

export default logger

// Usage dans les Server Actions
export async function createOrderAction(data: CreateOrderData) {
  try {
    logger.info({ userId: user.id, data }, 'Creating new order')
    
    const order = await createOrder(data)
    
    logger.info({ orderId: order.id, userId: user.id }, 'Order created successfully')
    return { data: order }
    
  } catch (error) {
    logger.error({ error, data, userId: user.id }, 'Failed to create order')
    throw error
  }
}
```

### 2. Health Checks

```typescript
// app/api/health/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    services: {
      database: 'unknown',
      redis: 'unknown',
      stripe: 'unknown'
    }
  }
  
  try {
    // Test base de données
    const supabase = await createSupabaseServerClient()
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    healthCheck.services.database = dbError ? 'error' : 'ok'
    
    // Test Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    await stripe.balance.retrieve()
    healthCheck.services.stripe = 'ok'
    
  } catch (error) {
    healthCheck.status = 'degraded'
  }
  
  const status = healthCheck.status === 'ok' ? 200 : 503
  
  return Response.json(healthCheck, { status })
}
```

### 3. Analytics et Métriques

```typescript
// lib/analytics.ts
import { Analytics } from '@segment/analytics-node'

const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY!
})

export const trackEvent = (
  userId: string,
  event: string,
  properties?: Record<string, any>
) => {
  if (process.env.NODE_ENV === 'production') {
    analytics.track({
      userId,
      event,
      properties: {
        ...properties,
        environment: 'production',
        timestamp: new Date().toISOString()
      }
    })
  }
}

// Usage
export async function addToCartAction(productId: string, quantity: number) {
  // ... logique métier
  
  trackEvent(userId, 'Product Added to Cart', {
    productId,
    quantity,
    cartValue: newTotal
  })
  
  return result
}
```

## 🗄️ Sauvegarde et Récupération

### 1. Sauvegarde Automatisée Supabase

```bash
# Script de sauvegarde quotidienne
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/herbisveritas"
PROJECT_REF="your-production-ref"

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
supabase db dump \
  --project-ref $PROJECT_REF \
  --role postgres \
  --schema public \
  --file "$BACKUP_DIR/db_backup_$DATE.sql"

# Sauvegarde des fichiers Storage
supabase storage download \
  --project-ref $PROJECT_REF \
  --recursive \
  "$BACKUP_DIR/storage_$DATE/"

# Compression
tar -czf "$BACKUP_DIR/full_backup_$DATE.tar.gz" \
  "$BACKUP_DIR/db_backup_$DATE.sql" \
  "$BACKUP_DIR/storage_$DATE/"

# Nettoyage des anciens backups (garde 30 jours)
find $BACKUP_DIR -name "full_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: full_backup_$DATE.tar.gz"
```

### 2. Plan de Récupération

```bash
# Procédure de restauration d'urgence
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
PROJECT_REF=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$PROJECT_REF" ]; then
  echo "Usage: ./restore-db.sh backup_file.sql project_ref"
  exit 1
fi

echo "⚠️ Cette opération va restaurer la base de données"
echo "Project: $PROJECT_REF"
echo "Backup: $BACKUP_FILE"
read -p "Continuer? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Restauration
  psql "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" \
    -f "$BACKUP_FILE"
  
  echo "✅ Restauration terminée"
else
  echo "❌ Restauration annulée"
fi
```

## 🚦 Processus de Déploiement Step-by-Step

### Phase 1: Préparation (1-2h)

```bash
# 1. Tests locaux complets
npm run test
npm run typecheck
npm run lint
npm run build

# 2. Mise à jour des dépendances
npm audit
npm update

# 3. Vérification de la base de données
supabase db diff --linked --use-migra
supabase db lint
```

### Phase 2: Déploiement Staging (30min)

```bash
# 1. Déploiement sur staging
git checkout develop
git pull origin develop
vercel --env staging

# 2. Tests sur staging
npm run test:e2e -- --env=staging

# 3. Validation fonctionnelle
# - Tests de bout en bout
# - Vérification des paiements
# - Tests de performance
```

### Phase 3: Déploiement Production (1h)

```bash
# 1. Merge vers main
git checkout main
git merge develop
git push origin main

# 2. Déploiement automatique via GitHub Actions
# Ou manuel :
npm run deploy:production

# 3. Vérifications post-déploiement
curl https://herbisveritas.fr/api/health
npm run test:smoke -- --env=production
```

### Phase 4: Monitoring Post-Déploiement (24h)

- ✅ Surveillance des logs d'erreur
- ✅ Métriques de performance (Core Web Vitals)
- ✅ Taux de conversion e-commerce
- ✅ Temps de réponse API
- ✅ Utilisation ressources Vercel/Supabase

## 🔄 Rollback et Récupération

### Procédure de Rollback Rapide

```bash
# 1. Rollback Vercel (immédiat)
vercel rollback https://herbisveritas.fr

# 2. Rollback base de données (si nécessaire)
supabase db reset --project-ref $PRODUCTION_REF

# 3. Restauration depuis backup
./restore-db.sh latest_backup.sql $PRODUCTION_REF

# 4. Validation du rollback
curl https://herbisveritas.fr/api/health
npm run test:smoke
```

### Points de Contrôle Critiques

| Étape | Vérification | Action en cas d'échec |
|-------|--------------|----------------------|
| **Build** | `npm run build` réussit | Corriger erreurs, re-tester |
| **Tests** | Tests passent 100% | Identifier/corriger régressions |
| **DB Migration** | Migrations appliquées | Rollback migration précédente |
| **Health Check** | API répond 200 | Vérifier logs, rollback si nécessaire |
| **Payment** | Test Stripe fonctionne | Vérifier webhooks et clés API |

Cette approche de déploiement garantit une mise en production sécurisée, monitorée et réversible pour HerbisVeritas V2.