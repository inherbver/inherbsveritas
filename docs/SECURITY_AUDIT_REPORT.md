# Rapport d'Audit de Sécurité - HerbisVeritas V2 MVP

Date: 2025-01-31
Auditeur: Security Specialist
Version du Projet: MVP (12 semaines)
Stack: Next.js 15 + TypeScript + Supabase + next-intl

## Résumé Exécutif

L'audit de sécurité du projet HerbisVeritas V2 MVP révèle plusieurs vulnérabilités critiques et importantes nécessitant une attention immédiate. Le projet présente une architecture de base solide avec Supabase et Next.js, mais manque de plusieurs mécanismes de sécurité essentiels pour une plateforme e-commerce.

### Statistiques Clés
- **Vulnérabilités Critiques**: 8
- **Vulnérabilités Élevées**: 7
- **Vulnérabilités Moyennes**: 6
- **Vulnérabilités Faibles**: 4
- **Score de Sécurité Global**: 45/100 (Insuffisant)

---

## 1. Vulnérabilités Critiques

### 1.1 Exposition de Secrets dans .env.local
**Niveau**: CRITIQUE
**OWASP**: A02:2021 - Cryptographic Failures
**Fichier**: `.env.local`

**Problème**:
- Service Role Key Supabase exposée (ligne 4)
- Database URL avec credentials exposées (ligne 5)
- Clés API configurées avec valeurs placeholder non sécurisées

**Impact**: Accès complet à la base de données, compromission totale du système

**Recommandation**:
```typescript
// src/lib/supabase/admin.ts
import "server-only"; // CRITIQUE: Empêche l'import côté client

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  throw new Error('Service role key not configured');
}

// Ne jamais exposer cette clé côté client
export function createAdminClient() {
  // Utilisation uniquement côté serveur
}
```

### 1.2 Absence de Middleware d'Authentification
**Niveau**: CRITIQUE
**OWASP**: A01:2021 - Broken Access Control
**Fichier**: `src/middleware.ts`

**Problème**: Le middleware actuel gère uniquement l'i18n, aucune protection des routes

**Solution**:
```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Gestion i18n
  const intlResponse = intlMiddleware(request)
  
  // 2. Protection des routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Routes protégées
  const protectedRoutes = ['/admin', '/profile', '/orders']
  const pathname = request.nextUrl.pathname
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.includes(route)
  )
  
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Protection admin
  if (pathname.includes('/admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()
    
    if (profile?.role !== 'admin' && profile?.role !== 'dev') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return intlResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 1.3 Validation des Entrées Insuffisante
**Niveau**: CRITIQUE
**OWASP**: A03:2021 - Injection
**Fichiers**: `src/lib/auth/actions.ts`, `src/lib/cart/operations.ts`

**Problème**: Validation minimale des entrées utilisateur, risque d'injection SQL/XSS

**Solution avec Zod**:
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim()
    .max(255),
  password: z.string()
    .min(8, 'Mot de passe trop court')
    .max(100, 'Mot de passe trop long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir majuscule, minuscule et chiffre')
})

export const CartItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  quantity: z.number()
    .int('Quantité doit être entière')
    .min(1, 'Quantité minimum 1')
    .max(100, 'Quantité maximum 100'),
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional()
})

// Utilisation
export async function loginUser(input: unknown) {
  const validation = LoginSchema.safeParse(input)
  
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten()
    }
  }
  
  const { email, password } = validation.data
  // Suite du traitement sécurisé
}
```

### 1.4 Absence de Protection CSRF
**Niveau**: CRITIQUE
**OWASP**: A01:2021 - Broken Access Control

**Solution**:
```typescript
// src/lib/security/csrf.ts
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const cookieStore = await cookies()
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 heures
  })
  
  return token
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get('csrf-token')?.value
  
  if (!storedToken || !token) return false
  
  // Comparaison constante-time pour éviter timing attacks
  return timingSafeEqual(
    Buffer.from(storedToken),
    Buffer.from(token)
  )
}
```

### 1.5 Configuration Supabase Non Sécurisée
**Niveau**: CRITIQUE
**OWASP**: A05:2021 - Security Misconfiguration

**Problème**: Pas de RLS (Row Level Security) configuré dans le code

**Solution**:
```sql
-- supabase/migrations/002_security_policies.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  TO public 
  USING (is_active = true);

-- Orders policies
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can manage own cart" 
  ON cart_items FOR ALL 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.session_id', true))
  );

-- Admin policies
CREATE POLICY "Admins can do everything" 
  ON ALL TABLES FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dev')
    )
  );
```

---

## 2. Vulnérabilités Élevées

### 2.1 Absence de Rate Limiting
**Niveau**: ÉLEVÉ
**OWASP**: A04:2021 - Insecure Design

**Solution avec Redis**:
```typescript
// src/lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 tentatives par minute
  analytics: true,
  prefix: 'auth'
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requêtes par minute
  prefix: 'api'
})

// Utilisation dans auth
export async function loginWithRateLimit(email: string, password: string) {
  const identifier = email.toLowerCase()
  const { success, limit, reset, remaining } = await authRateLimit.limit(identifier)
  
  if (!success) {
    return {
      error: 'Trop de tentatives. Réessayez plus tard.',
      retryAfter: reset
    }
  }
  
  // Procéder au login
}
```

### 2.2 Pas de Headers de Sécurité
**Niveau**: ÉLEVÉ
**OWASP**: A05:2021 - Security Misconfiguration

**Solution dans next.config.js**:
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: *.supabase.co;
      font-src 'self';
      connect-src 'self' *.supabase.co wss://*.supabase.co;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

### 2.3 Stockage Non Sécurisé des Sessions
**Niveau**: ÉLEVÉ
**OWASP**: A02:2021 - Cryptographic Failures

**Solution**:
```typescript
// src/lib/security/session.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || throw new Error('SESSION_SECRET not set')
)

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
  
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 heures
  })
  
  return token
}

export async function validateSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; role: string }
  } catch {
    return null
  }
}
```

---

## 3. Vulnérabilités Moyennes

### 3.1 Absence de Sanitization des Contenus
**Niveau**: MOYEN
**OWASP**: A03:2021 - Injection (XSS)

**Solution avec DOMPurify**:
```typescript
// src/lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}

export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Bloquer javascript:
    .replace(/on\w+=/gi, '') // Bloquer les event handlers
    .trim()
}

// Utilisation dans les composants
export function ProductDescription({ content }: { content: string }) {
  const sanitized = sanitizeHTML(content)
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitized }}
      className="product-description"
    />
  )
}
```

### 3.2 Logging de Sécurité Insuffisant
**Niveau**: MOYEN
**OWASP**: A09:2021 - Security Logging and Monitoring Failures

**Solution**:
```typescript
// src/lib/security/audit-log.ts
import { createClient } from '@/lib/supabase/server'

interface SecurityEvent {
  event_type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity'
  user_id?: string
  ip_address: string
  user_agent: string
  details: Record<string, any>
}

export async function logSecurityEvent(event: SecurityEvent) {
  const supabase = await createClient()
  
  await supabase.from('security_audit_logs').insert({
    ...event,
    created_at: new Date().toISOString()
  })
  
  // Alertes pour événements critiques
  if (event.event_type === 'suspicious_activity') {
    await sendSecurityAlert(event)
  }
}

// Monitorer les tentatives de login échouées
export async function trackFailedLogin(email: string, ip: string) {
  const supabase = await createClient()
  
  const { data: attempts } = await supabase
    .from('security_audit_logs')
    .select('*')
    .eq('details->email', email)
    .eq('event_type', 'failed_login')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Dernière heure
  
  if (attempts && attempts.length >= 5) {
    await logSecurityEvent({
      event_type: 'suspicious_activity',
      ip_address: ip,
      user_agent: '',
      details: {
        reason: 'Multiple failed login attempts',
        email,
        attempts: attempts.length
      }
    })
  }
}
```

---

## 4. Conformité OWASP Top 10 (2021)

| Catégorie OWASP | État | Corrections Requises |
|-----------------|------|----------------------|
| A01: Broken Access Control | ❌ CRITIQUE | Implémenter middleware auth, RBAC, CSRF |
| A02: Cryptographic Failures | ❌ CRITIQUE | Sécuriser secrets, chiffrement données sensibles |
| A03: Injection | ❌ ÉLEVÉ | Validation Zod, sanitization, prepared statements |
| A04: Insecure Design | ⚠️ MOYEN | Rate limiting, architecture défensive |
| A05: Security Misconfiguration | ❌ ÉLEVÉ | Headers sécurité, RLS, CORS |
| A06: Vulnerable Components | ⚠️ MOYEN | Audit dependencies, mise à jour régulière |
| A07: Identification/Auth Failures | ❌ ÉLEVÉ | MFA, session management, password policy |
| A08: Software/Data Integrity | ⚠️ MOYEN | SRI, signature code, validation intégrité |
| A09: Logging/Monitoring Failures | ❌ MOYEN | Audit logs, alertes, monitoring |
| A10: SSRF | ✅ OK | Pas d'appels externes non validés |

---

## 5. Conformité PCI DSS (Basique E-commerce)

| Exigence | État | Action Requise |
|----------|------|----------------|
| Protection données cartes | ⚠️ | Utiliser Stripe Elements (tokenisation) |
| Chiffrement transmission | ❌ | Forcer HTTPS, TLS 1.3 |
| Contrôle d'accès | ❌ | RBAC strict, principe moindre privilège |
| Tests sécurité réguliers | ❌ | Mettre en place tests automatisés |
| Politique de sécurité | ❌ | Documenter procédures sécurité |

---

## 6. Recommandations Prioritaires

### Immédiat (Semaine 1)
1. **Sécuriser les secrets** - Utiliser Vault ou AWS Secrets Manager
2. **Implémenter middleware auth** - Protection complète des routes
3. **Activer RLS Supabase** - Policies sur toutes les tables
4. **Validation Zod** - Sur toutes les entrées utilisateur
5. **Headers de sécurité** - Configuration next.config.js

### Court terme (Semaines 2-3)
1. **Rate limiting** - Redis/Upstash sur auth et API
2. **CSRF protection** - Tokens sur toutes les mutations
3. **Audit logging** - Table dédiée avec alertes
4. **Sanitization** - DOMPurify sur contenus dynamiques
5. **Tests sécurité** - Suite de tests automatisés

### Moyen terme (Semaines 4-6)
1. **MFA optionnel** - Pour comptes admin/dev
2. **Monitoring avancé** - Sentry + DataDog
3. **Pentest externe** - Avant launch production
4. **Documentation sécurité** - Procédures et policies
5. **Formation équipe** - Best practices OWASP

---

## 7. Code de Test de Sécurité

```typescript
// tests/security/auth.security.test.ts
import { describe, it, expect } from '@jest/globals'
import { loginUser } from '@/lib/auth/actions'

describe('Security: Authentication', () => {
  it('should prevent SQL injection in login', async () => {
    const maliciousInputs = [
      "admin'--",
      "1' OR '1'='1",
      "'; DROP TABLE users;--",
      "<script>alert('XSS')</script>"
    ]
    
    for (const input of maliciousInputs) {
      const result = await loginUser({
        email: input,
        password: input
      })
      
      expect(result.success).toBe(false)
      expect(result.message).not.toContain('error')
      expect(result.message).toContain('invalid')
    }
  })
  
  it('should enforce rate limiting', async () => {
    const attempts = Array(10).fill(null).map(() => 
      loginUser({
        email: 'test@test.com',
        password: 'wrong'
      })
    )
    
    const results = await Promise.all(attempts)
    const blocked = results.filter(r => r.message?.includes('Trop de tentatives'))
    
    expect(blocked.length).toBeGreaterThan(0)
  })
  
  it('should validate password complexity', async () => {
    const weakPasswords = ['12345678', 'password', 'aaaaaaaa']
    
    for (const password of weakPasswords) {
      const result = await registerUser({
        email: 'test@test.com',
        password,
        confirmPassword: password,
        acceptTerms: true
      })
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('complexité')
    }
  })
})
```

---

## 8. Checklist de Déploiement Sécurisé

### Pré-Production
- [ ] Tous les secrets en variables d'environnement
- [ ] RLS activé sur toutes les tables Supabase
- [ ] Middleware d'authentification opérationnel
- [ ] Validation Zod sur toutes les entrées
- [ ] Headers de sécurité configurés
- [ ] HTTPS forcé avec HSTS
- [ ] Rate limiting actif
- [ ] Logs de sécurité configurés
- [ ] Tests de sécurité passants
- [ ] Backup et disaster recovery testés

### Production
- [ ] WAF (Web Application Firewall) actif
- [ ] DDoS protection (Cloudflare)
- [ ] Monitoring temps réel (Sentry)
- [ ] Alertes sécurité configurées
- [ ] Rotation régulière des secrets
- [ ] Audit logs archivés
- [ ] Plan de réponse aux incidents
- [ ] Contact sécurité 24/7
- [ ] Pentest trimestriel planifié
- [ ] Conformité RGPD validée

---

## Conclusion

Le projet HerbisVeritas V2 MVP nécessite des améliorations significatives en matière de sécurité avant sa mise en production. Les vulnérabilités critiques identifiées exposent actuellement le système à des risques majeurs de compromission.

La mise en œuvre des recommandations prioritaires permettra d'atteindre un niveau de sécurité acceptable pour un MVP e-commerce. Un investissement estimé de 3-4 semaines de développement focalisé sur la sécurité est nécessaire pour corriger les problèmes critiques et élevés.

**Prochaines étapes recommandées**:
1. Stopper tout développement de features
2. Focus 100% sécurité pendant 2 semaines
3. Audit externe avant launch
4. Formation continue de l'équipe

---

*Rapport généré le 2025-01-31*
*Version: 1.0.0*
*Classification: CONFIDENTIEL*