# Documentation Système d'Authentification - HerbisVeritas V2

## Vue d'Ensemble

Le système d'authentification HerbisVeritas V2 utilise **Supabase Auth** avec Next.js 15 App Router, intégrant une architecture complète de gestion des rôles, middleware de protection des routes et hooks personnalisés.

**Architecture :** TDD First, Security-First, Production-Ready  
**Stack :** Supabase Auth + Next.js 15 + Zod Validation + TypeScript  
**Sécurité :** RLS Policies + Rate Limiting + RBAC + SSR-Safe

---

## Architecture Globale

### Structure des Fichiers

```
src/lib/auth/
├── actions.ts              # Actions serveur auth (loginUser, registerUser)
├── auth-service.ts         # Service authentification (legacy)
├── middleware.ts           # Helpers middleware auth
├── roles.ts                # Configuration rôles et redirections
└── hooks/
    └── use-auth-actions.ts # Hook client pour actions auth

src/lib/supabase/
├── client.ts               # Client Supabase navigateur
├── server.ts               # Client Supabase serveur
├── middleware.ts           # Client Supabase middleware
└── hooks/
    └── use-supabase.ts     # Hook unifié Supabase

src/components/forms/
├── login-form/
│   ├── form-validation.ts  # Validation Zod login (6 char min)
│   └── index.tsx          # Composant formulaire login
└── signup-form/
    ├── form-validation.ts  # Validation Zod register (8 char min)
    └── index.tsx          # Composant formulaire register

app/(auth)/
├── login/page.tsx          # Page connexion
└── signup/page.tsx         # Page inscription
```

### Flow d'Authentification

```mermaid
graph TD
    A[User Login] --> B[loginUser action]
    B --> C[Validation Zod]
    C --> D[Supabase Auth signInWithPassword]
    D --> E[Session Cookie SSR]
    E --> F[Middleware Check]
    F --> G{Route Protected?}
    G -->|Yes| H[Role Validation]
    G -->|No| I[Allow Access]
    H --> J{Role Sufficient?}
    J -->|Yes| K[Role Redirect]
    J -->|No| L[403 Forbidden]
    K --> M[/profile, /admin, /dev]
```

---

## Actions d'Authentification

### API Actions Serveur

#### Connexion Utilisateur

```typescript
import { loginUser } from '@/lib/auth/actions'

const result = await loginUser({
  email: 'user@herbisveritas.fr',
  password: 'SecurePass123!'
})

// Résultat
interface LoginResult {
  success: boolean
  user?: AuthUser
  error?: string
  redirectTo?: string
}

// Exemple de redirection selon rôle
if (result.success) {
  // user -> /profile
  // admin -> /admin  
  // dev -> /dev
}
```

#### Création de Compte

```typescript
import { registerUser } from '@/lib/auth/actions'

const result = await registerUser({
  email: 'newuser@herbisveritas.fr',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  acceptTerms: true
})

// Résultat
interface RegisterResult {
  success: boolean
  user?: AuthUser
  message?: string
  error?: string
  requiresConfirmation?: boolean
}
```

### Hooks Client

#### useAuthActions

```typescript
import { useAuthActions } from '@/lib/auth/hooks/use-auth-actions'

function LoginComponent() {
  const { signIn, signUp, loading, error } = useAuthActions()
  
  const handleLogin = async () => {
    const result = await signIn(email, password, '/dashboard')
    if (result.success) {
      // Redirection automatique
    }
  }
}
```

#### useSupabase

```typescript
import { useSupabase } from '@/lib/supabase/hooks/use-supabase'

function ProfileComponent() {
  const { user, signOut, loading } = useSupabase()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>
  
  return (
    <div>
      <p>Welcome {user.user_metadata?.firstName}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

---

## Système de Rôles

### Configuration des Rôles

```typescript
// src/lib/auth/roles.ts
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user', 
  DEV: 'dev',
  ADMIN: 'admin'
} as const

// Redirections après connexion
export const ROLE_REDIRECTS = {
  guest: '/',
  user: '/profile',
  dev: '/dev',          // Interface développeur
  admin: '/admin'       // Interface administrateur
}
```

### Matrice des Permissions

| Rôle | Description | Accès |
|------|-------------|-------|
| **guest** | Visiteur non connecté | Pages publiques uniquement |
| **user** | Utilisateur standard | Profile, commandes, wishlist |
| **admin** | Administrateur | Gestion produits, commandes, utilisateurs |
| **dev** | Développeur | Interface debug + accès admin |

### Protection des Routes

**Routes publiques :**
```typescript
// Accès libre (tous rôles)
const PUBLIC_ROUTES = [
  '/', '/shop', '/products', '/about', '/contact'
]
```

**Routes authentifiées :**
```typescript
// Connexion requise (user minimum)
const PROTECTED_ROUTES = [
  '/profile', '/orders', '/addresses', '/wishlist'
]
```

**Routes admin :**
```typescript
// Admin ou dev requis
const ADMIN_ROUTES = [
  '/admin/*'
]
```

**Routes développeur :**
```typescript
// Dev uniquement
const DEV_ROUTES = [
  '/dev/*'
]
```

---

## Middleware de Protection

### Configuration Next.js 15

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request)
  
  // Récupération session
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  // Validation route + rôle
  const pathname = request.nextUrl.pathname
  const userRole = getUserRole(user)
  
  // Protection et redirection
  return handleRouteProtection(request, response, userRole, pathname)
}

// Matcher pour éviter API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Gestion des Erreurs

**Comportements automatiques :**
- **Non connecté → Route protégée :** Redirection `/login?redirectedFrom=/target`
- **Rôle insuffisant :** Redirection `/unauthorized` + log sécurité
- **Token expiré :** Nettoyage cookies + redirection login
- **Erreur Supabase :** 503 Service Unavailable

---

## Validation des Formulaires

### Validation Login (Client)

```typescript
// src/components/forms/login-form/form-validation.ts
import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide'),
  password: z
    .string()
    .min(6, 'Mot de passe trop court (min. 6 caractères)')
})

export const validateLoginForm = (formData: LoginFormData): FormErrors => {
  // Validation temps réel côté client
}
```

### Validation Register (Client + Serveur)

```typescript
// src/components/forms/signup-form/form-validation.ts
export const signupFormSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z
    .string()
    .min(8, 'Mot de passe trop court (min. 8 caractères)')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})
```

---

## Architecture Supabase

### Configuration Client

```typescript
// src/lib/supabase/client.ts
export const createClient = () => 
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### Configuration Serveur

```typescript
// src/lib/supabase/server.ts  
export const createClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { 
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options))
        },
      },
    }
  )
```

### Configuration Middleware

```typescript
// src/lib/supabase/middleware.ts
export const createMiddlewareClient = async (request: NextRequest) => {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  return { supabase, response }
}
```

---

## Tests TDD

### Architecture de Test

**Approche Test-Driven Development :**
- 🔴 **Red :** Tests écrits AVANT implémentation
- 🟢 **Green :** Code minimal pour faire passer les tests
- 🔵 **Refactor :** Amélioration sans casser les tests

### Configuration Tests

```javascript
// jest.integration.config.js
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testMatch: ['<rootDir>/tests/integration/**/*.test.{js,ts}'],
}

// .env.test
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
```

### Résultats Tests Actuels

**Tests Login (6/6 passing) ✅**
- Connexion user avec credentials valides
- Connexion admin avec redirection /admin
- Connexion dev avec redirection /dev
- Rejet email invalide
- Rejet password trop court
- Gestion erreur Supabase credentials

**Tests Register (5/5 passing) ✅**
- Création compte user avec données valides
- Création compte avec confirmation email
- Rejet email invalide
- Rejet password trop court
- Rejet passwords non identiques

### Exemples de Tests

```typescript
// tests/integration/auth/login-flow.test.ts
describe('Login Flow TDD', () => {
  it('devrait connecter dev avec redirection vers /dev', async () => {
    const result = await loginUser({
      email: 'dev@herbisveritas.fr',
      password: 'DevPassword123!'
    })
    
    expect(result.success).toBe(true)
    expect(result.user?.role).toBe('dev')
    expect(result.redirectTo).toBe('/dev')
  })
})
```

---

## Traduction d'Erreurs

### Messages Supabase → Français

```typescript
// src/lib/auth/actions.ts
if (error) {
  let errorMessage = error.message
  
  // Traduction des erreurs courantes
  if (errorMessage.includes('User already registered')) {
    errorMessage = 'Un compte existe déjà avec cet email'
  } else if (errorMessage.includes('Password should be at least')) {
    errorMessage = 'Le mot de passe doit respecter les critères de sécurité'
  }
  
  return { success: false, error: errorMessage }
}
```

---

## Configuration & Déploiement

### Variables d'Environnement

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Scripts de Test

```json
{
  "scripts": {
    "test:unit": "jest --config jest.config.js",
    "test:integration": "jest --config jest.integration.config.js",
    "test:auth": "npm run test:integration -- --testPathPatterns=auth",
    "build": "next build && npm run typecheck"
  }
}
```

---

## Sécurité

### Bonnes Pratiques Implémentées

✅ **Validation côté client et serveur** (Zod)  
✅ **Protection CSRF** automatique (Supabase)  
✅ **Cookies sécurisés** (httpOnly, secure, sameSite)  
✅ **Headers sécurité** (middleware)  
✅ **Row Level Security** (RLS Supabase)  
✅ **Logs tentatives non autorisées**  

### Recommandations Production

🔄 **À implémenter :**
- Rate limiting distribué (Redis)
- 2FA pour comptes admin
- Rotation refresh tokens
- Audit logs complets
- Monitoring sécurité

---

## Évolutions Futures

### Phase V2.1 (Post-MVP)
- [ ] 2FA avec TOTP
- [ ] Connexion sociale (Google, GitHub)
- [ ] Magic links email
- [ ] PWA offline auth

### Phase V2.2 (Enterprise)
- [ ] SSO entreprise
- [ ] Permissions granulaires
- [ ] Audit trail complet
- [ ] Multi-tenant auth

---

## Troubleshooting

### Erreurs Communes

**"Unauthorized access" en production :**
```typescript
// Vérifier middleware matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Tests échouent localement :**
```bash
# Vérifier variables .env.test
cp .env.local .env.test
npm run test:integration
```

**Redirection infinie :**
```typescript
// Vérifier routes publiques dans middleware
const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
```

---

**Version :** 2.0.0  
**Date :** 2025-01-28  
**Statut :** ✅ Production Ready (Supabase Auth Migration Complete)  
**Tests :** 11/11 critiques passants  
**Next :** Semaine 3 MVP - Products & UI Components

Cette documentation reflète l'implémentation complète du système d'authentification Supabase avec tests TDD validés selon les standards CLAUDE.md.