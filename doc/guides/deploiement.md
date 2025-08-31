# Guide Déploiement

## Environnements

### Production
- **Hébergement :** Vercel
- **Base de données :** Supabase Production
- **CDN :** Vercel Edge Network
- **Domaine :** herbisveritas.fr

### Staging
- **URL :** staging.herbisveritas.fr
- **Base de données :** Supabase Staging
- **Tests automatisés :** GitHub Actions

## Configuration Production

### Variables Environnement
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://herbisveritas.fr

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=<production_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<production_service_key>

# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe_live_pub>
STRIPE_SECRET_KEY=<stripe_live_secret>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
```

### Build Production
```bash
# Validation avant déploiement
npm run lint
npm run typecheck
npm run test:unit
npm run build

# Analyse bundle
npm run analyze
```

## Pipeline CI/CD

### GitHub Actions
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:unit
      - run: npm run build
      - uses: amondnet/vercel-action@v25
```

### Migrations
```bash
# Migrations production Supabase
npx supabase db push --linked

# Vérification post-migration
npm run test:integration
```

## Monitoring

### Métriques Essentielles
- Temps de chargement < 2s
- Taux erreur < 0.1 pourcent
- Score Lighthouse > 90
- Disponibilité > 99.9 pourcent

### Logs
```bash
# Logs Vercel
npx vercel logs

# Logs Supabase
npx supabase logs api --linked
```

## Sauvegardes

### Base de Données
- Sauvegardes automatiques Supabase quotidiennes
- Export manuel avant migrations critiques

### Assets
- Images stockées Supabase Storage
- Réplication CDN automatique