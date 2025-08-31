# Guidelines Sécurité

## Authentification

### Validation Côté Serveur
```typescript
// Validation stricte dans auth actions
if (!validateEmail(credentials.email)) {
  return {
    success: false,
    message: AUTH_MESSAGES.validation.emailInvalid
  }
}

if (credentials.password.length < MIN_PASSWORD_LENGTH) {
  return {
    success: false,
    message: AUTH_MESSAGES.validation.passwordTooShort
  }
}
```

### Protection Mots de Passe
- Longueur minimum 8 caractères
- Validation complexité côté client et serveur
- Hash automatique Supabase Auth
- Rate limiting tentatives connexion

## Gestion Secrets

### Variables Environnement
```bash
# Public (bundle client)
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<key>

# Privées (serveur uniquement)
SUPABASE_SERVICE_ROLE_KEY=<secret>
STRIPE_SECRET_KEY=<secret>
```

### Server-Only Modules
```typescript
import "server-only"

// Code sensible côté serveur uniquement
export const stripeServer = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

## Protection OWASP

### Injection SQL
- Paramètres Supabase automatiquement échappés
- Validation types TypeScript stricte
- Sanitisation entrées utilisateur

### XSS Prevention
```tsx
// Sanitisation contenu TipTap
import DOMPurify from 'dompurify'

const sanitizedContent = DOMPurify.sanitize(htmlContent)
```

### CSRF Protection
- Next.js CSRF tokens automatiques
- Same-origin policy stricte
- Headers sécurité configurés

## Row Level Security

### Policies RLS
```sql
-- Users peuvent voir uniquement leurs données
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Admins accès complet
CREATE POLICY "Admins full access" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Validation Rôles
```typescript
export function requireRole(role: UserRole) {
  return async (request: Request) => {
    const user = await getCurrentUser()
    if (!user || user.role !== role) {
      return new Response('Forbidden', { status: 403 })
    }
    return null
  }
}
```

## Validation Données

### Côté Client
- Validation temps réel formulaires
- Messages AuthMessage cohérents
- Feedback utilisateur immédiat

### Côté Serveur
```typescript
// Validation systématique API
export async function validateProductData(data: any): Promise<AuthMessage | null> {
  if (!data.name?.fr || data.name.fr.trim().length < 3) {
    return AUTH_MESSAGES.validation.productNameRequired
  }
  
  if (data.price <= 0) {
    return AUTH_MESSAGES.validation.priceInvalid
  }
  
  return null
}
```

## Audit et Logs

### Logs Sécurité
- Actions administrateur tracées
- Tentatives connexion suspectes
- Modifications données sensibles

### Monitoring
- Alertes échecs authentification
- Surveillance patterns d'attaque
- Métriques sécurité temps réel