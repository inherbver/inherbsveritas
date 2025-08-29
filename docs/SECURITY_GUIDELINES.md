# Directives de Sécurité - HerbisVeritas V2

## 🛡️ Vue d'Ensemble

Ce document établit les directives de sécurité complètes pour HerbisVeritas V2, basées sur les recommandations **OWASP** et les meilleures pratiques de sécurité applicative moderne. Il couvre tous les aspects critiques depuis l'authentification jusqu'au déploiement sécurisé.

---

## 🔐 Architecture de Sécurité Globale

### Modèle de Sécurité Défense en Profondeur

```mermaid
graph TD
    A[Client/Browser] --> B[Web Application Firewall - WAF]
    B --> C[Load Balancer + Rate Limiting]
    C --> D[Next.js Application - Edge Runtime]
    D --> E[Server Actions + Validation]
    E --> F[Supabase RLS Policies]
    F --> G[PostgreSQL Database]
    
    H[Authentication Layer] --> I[Row Level Security]
    I --> J[API Rate Limiting]
    J --> K[Input Validation]
    K --> L[Output Encoding]
    
    M[Monitoring & Logging] --> N[Security Events]
    N --> O[Incident Response]
```

### Stack de Sécurité

```typescript
// Configuration sécurité globale
const SECURITY_STACK = {
  frontend: 'Next.js 15 + React Server Components',
  backend: 'Supabase + Row Level Security',
  authentication: 'Supabase Auth (Email-only)',
  authorization: 'Role-based + RLS',
  validation: 'Zod schemas + next-safe-action',
  headers: 'Security headers middleware',
  csrf: 'Double-submit cookies',
  xss: 'Content Security Policy + Input sanitization',
  monitoring: 'Audit logs + Security events'
} as const
```

---

## 🔒 Authentification et Autorisation

### Architecture d'Authentification Sécurisée

```typescript
// lib/auth/secure-auth.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Authentification sécurisée avec validation côté serveur
 */
export async function authenticateUser() {
  const supabase = createSupabaseServerClient()
  
  // Validation session avec timeout
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    // Log de tentative d'accès non autorisée
    await logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS',
      userId: null,
      ip: headers().get('x-forwarded-for'),
      userAgent: headers().get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    redirect('/auth/login')
  }
  
  return user
}

/**
 * Vérification des permissions avec cache
 */
export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const supabase = createSupabaseServerClient()
  
  // Cache permission check (5 minutes)
  const cacheKey = `permission:${userId}:${permission}`
  const cached = await redis.get(cacheKey)
  
  if (cached !== null) {
    return cached === 'true'
  }
  
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('permission', permission)
    .single()
  
  const hasPermission = !error && !!data
  
  // Cache result
  await redis.setex(cacheKey, 300, hasPermission.toString())
  
  return hasPermission
}
```

### Politique de Mots de Passe Sécurisée

```typescript
// lib/auth/password-policy.ts
import { z } from 'zod'

/**
 * Schema de validation mot de passe conforme OWASP
 */
export const PasswordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  .regex(/(?=.*[a-z])/, 'Au moins une lettre minuscule requise')
  .regex(/(?=.*[A-Z])/, 'Au moins une lettre majuscule requise')
  .regex(/(?=.*\d)/, 'Au moins un chiffre requis')
  .regex(/(?=.*[^A-Za-z\d])/, 'Au moins un caractère spécial requis')
  .refine(
    (password) => !isCommonPassword(password),
    'Ce mot de passe est trop commun'
  )
  .refine(
    (password) => !containsPII(password),
    'Le mot de passe ne doit pas contenir d\'informations personnelles'
  )

/**
 * Vérification mots de passe communs
 */
const COMMON_PASSWORDS = new Set([
  'password123', 'admin123', 'qwerty123',
  'password1', 'azerty123', 'motdepasse'
])

function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase())
}

/**
 * Détection PII dans le mot de passe
 */
function containsPII(password: string): boolean {
  // Vérifier les patterns d'email, téléphone, dates de naissance
  const piiPatterns = [
    /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{10}\b/, // Numéro de téléphone
    /\b(19|20)\d{2}\b/, // Années
  ]
  
  return piiPatterns.some(pattern => pattern.test(password))
}

/**
 * Authentification avec protection contre brute force
 */
export async function secureLogin(
  email: string, 
  password: string,
  ip: string
): Promise<ActionResult<User>> {
  
  // Vérification rate limiting
  const attempts = await getRateLimitAttempts(email, ip)
  
  if (attempts.email > 5) {
    await logSecurityEvent({
      type: 'BRUTE_FORCE_EMAIL',
      email,
      ip,
      attempts: attempts.email
    })
    
    return {
      success: false,
      error: 'Trop de tentatives. Réessayez dans 15 minutes.'
    }
  }
  
  if (attempts.ip > 10) {
    await logSecurityEvent({
      type: 'BRUTE_FORCE_IP',
      ip,
      attempts: attempts.ip
    })
    
    return {
      success: false,
      error: 'Trop de tentatives depuis cette adresse IP.'
    }
  }
  
  // Authentification constante-temps pour éviter l'énumération
  const startTime = performance.now()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  // Temps minimum pour éviter les attaques temporelles
  const minDuration = 200 // ms
  const elapsed = performance.now() - startTime
  if (elapsed < minDuration) {
    await new Promise(resolve => 
      setTimeout(resolve, minDuration - elapsed)
    )
  }
  
  if (error) {
    await incrementRateLimitAttempts(email, ip)
    
    return {
      success: false,
      error: 'Email ou mot de passe incorrect'
    }
  }
  
  // Reset rate limits on successful login
  await resetRateLimitAttempts(email, ip)
  
  await logSecurityEvent({
    type: 'SUCCESSFUL_LOGIN',
    userId: data.user.id,
    email,
    ip
  })
  
  return {
    success: true,
    data: data.user
  }
}
```

### Row Level Security (RLS) Policies

```sql
-- policies/products.sql

-- Lecture produits : Tous les utilisateurs peuvent voir les produits actifs
CREATE POLICY "products_read_public" ON products
  FOR SELECT 
  USING (status = 'active');

-- Création produits : Seuls les admins
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Modification produits : Admins ou propriétaires
CREATE POLICY "products_update_authorized" ON products
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role = 'admin' OR 
        profiles.id = products.created_by
      )
    )
  );

-- Suppression produits : Seuls les admins
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- policies/orders.sql

-- Lecture commandes : Utilisateurs voient leurs propres commandes
CREATE POLICY "orders_read_own" ON orders
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Création commandes : Utilisateurs authentifiés uniquement
CREATE POLICY "orders_insert_authenticated" ON orders
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Modification commandes : Propriétaires et admins selon le statut
CREATE POLICY "orders_update_conditional" ON orders
  FOR UPDATE 
  USING (
    CASE 
      WHEN status IN ('pending', 'confirmed') THEN user_id = auth.uid()
      WHEN status IN ('processing', 'shipped', 'delivered') THEN 
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'manager')
        )
      ELSE false
    END
  );
```

---

## 🛡️ Protection Contre les Vulnérabilités OWASP Top 10

### A01 - Broken Access Control

```typescript
// lib/auth/access-control.ts

/**
 * Contrôle d'accès basé sur les rôles avec validation stricte
 */
export class AccessControl {
  private static permissions: Record<string, string[]> = {
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'products:read', 'products:create', 'products:update', 'products:delete',
      'orders:read', 'orders:update', 'orders:delete',
      'analytics:read', 'audit:read'
    ],
    manager: [
      'users:read', 'users:update',
      'products:read', 'products:create', 'products:update',
      'orders:read', 'orders:update',
      'analytics:read'
    ],
    user: [
      'products:read',
      'orders:read:own', 'orders:create:own', 'orders:update:own'
    ]
  }
  
  /**
   * Vérification permission avec validation ABAC
   */
  public static async checkPermission(
    userId: string,
    action: string,
    resource?: any
  ): Promise<boolean> {
    
    // Récupération du rôle utilisateur avec cache
    const userRole = await this.getUserRole(userId)
    
    if (!userRole) {
      await logSecurityEvent({
        type: 'ACCESS_DENIED_NO_ROLE',
        userId,
        action,
        timestamp: new Date().toISOString()
      })
      return false
    }
    
    // Vérification permission de base
    const basePermissions = this.permissions[userRole] || []
    const hasBasePermission = basePermissions.includes(action) ||
                             basePermissions.includes(action.replace(':own', ''))
    
    if (!hasBasePermission) {
      await logSecurityEvent({
        type: 'ACCESS_DENIED_INSUFFICIENT_PERMISSION',
        userId,
        userRole,
        action,
        timestamp: new Date().toISOString()
      })
      return false
    }
    
    // Vérification propriété pour les actions ":own"
    if (action.endsWith(':own') && resource) {
      const isOwner = await this.checkOwnership(userId, resource)
      
      if (!isOwner) {
        await logSecurityEvent({
          type: 'ACCESS_DENIED_NOT_OWNER',
          userId,
          action,
          resourceId: resource.id,
          timestamp: new Date().toISOString()
        })
        return false
      }
    }
    
    return true
  }
  
  /**
   * Middleware de contrôle d'accès
   */
  public static withPermission(permission: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value
      
      descriptor.value = async function(...args: any[]) {
        const userId = await getCurrentUserId()
        
        if (!userId) {
          throw new Error('Non authentifié')
        }
        
        const hasPermission = await AccessControl.checkPermission(
          userId, 
          permission,
          args[0] // Premier argument comme resource
        )
        
        if (!hasPermission) {
          throw new Error(`Permission refusée: ${permission}`)
        }
        
        return originalMethod.apply(this, args)
      }
      
      return descriptor
    }
  }
  
  private static async checkOwnership(
    userId: string, 
    resource: any
  ): Promise<boolean> {
    // Vérification selon le type de resource
    if (resource.user_id) {
      return resource.user_id === userId
    }
    
    if (resource.created_by) {
      return resource.created_by === userId
    }
    
    return false
  }
}

// Usage avec décorateur
export class OrderService {
  
  @AccessControl.withPermission('orders:read:own')
  async getOrder(id: string) {
    return await getOrderById(id)
  }
  
  @AccessControl.withPermission('orders:update')
  async updateOrderStatus(id: string, status: string) {
    return await updateOrder(id, { status })
  }
}
```

### A02 - Cryptographic Failures

```typescript
// lib/security/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * Chiffrement AES-256-GCM pour données sensibles
 */
export class SecureEncryption {
  private static readonly algorithm = 'aes-256-gcm'
  private static readonly keyLength = 32
  private static readonly ivLength = 16
  private static readonly tagLength = 16
  private static readonly saltLength = 32
  
  /**
   * Chiffrement avec dérivation de clé PBKDF2
   */
  public static async encrypt(
    plaintext: string,
    password: string
  ): Promise<string> {
    try {
      // Génération salt et IV aléatoires
      const salt = randomBytes(this.saltLength)
      const iv = randomBytes(this.ivLength)
      
      // Dérivation de clé avec scrypt (résistant aux attaques par dictionnaire)
      const key = (await scryptAsync(password, salt, this.keyLength)) as Buffer
      
      // Chiffrement
      const cipher = createCipheriv(this.algorithm, key, iv)
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ])
      
      // Tag d'authentification
      const tag = cipher.getAuthTag()
      
      // Format: salt(32) + iv(16) + tag(16) + encrypted
      const result = Buffer.concat([salt, iv, tag, encrypted])
      
      return result.toString('base64')
    } catch (error) {
      throw new Error('Échec du chiffrement')
    }
  }
  
  /**
   * Déchiffrement avec vérification d'intégrité
   */
  public static async decrypt(
    encryptedData: string,
    password: string
  ): Promise<string> {
    try {
      const data = Buffer.from(encryptedData, 'base64')
      
      // Extraction des composants
      const salt = data.subarray(0, this.saltLength)
      const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength)
      const tag = data.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      )
      const encrypted = data.subarray(this.saltLength + this.ivLength + this.tagLength)
      
      // Dérivation de clé
      const key = (await scryptAsync(password, salt, this.keyLength)) as Buffer
      
      // Déchiffrement
      const decipher = createDecipheriv(this.algorithm, key, iv)
      decipher.setAuthTag(tag)
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])
      
      return decrypted.toString('utf8')
    } catch (error) {
      throw new Error('Échec du déchiffrement ou données corrompues')
    }
  }
}

/**
 * Hachage sécurisé des mots de passe
 */
export class PasswordHashing {
  private static readonly rounds = 12 // bcrypt cost factor
  
  /**
   * Hachage avec bcrypt
   */
  public static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, this.rounds)
  }
  
  /**
   * Vérification constant-time
   */
  public static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, hash)
  }
}

/**
 * Génération de tokens sécurisés
 */
export class TokenGenerator {
  /**
   * Token cryptographiquement sécurisé
   */
  public static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex')
  }
  
  /**
   * CSRF Token avec expiration
   */
  public static generateCSRFToken(userId: string): string {
    const timestamp = Date.now().toString()
    const random = this.generateSecureToken(16)
    const payload = `${userId}:${timestamp}:${random}`
    
    return Buffer.from(payload).toString('base64url')
  }
  
  /**
   * Validation CSRF Token
   */
  public static validateCSRFToken(
    token: string,
    userId: string,
    maxAge: number = 3600000 // 1 heure
  ): boolean {
    try {
      const payload = Buffer.from(token, 'base64url').toString()
      const [tokenUserId, timestamp] = payload.split(':')
      
      if (tokenUserId !== userId) {
        return false
      }
      
      const tokenTime = parseInt(timestamp)
      const now = Date.now()
      
      return (now - tokenTime) <= maxAge
    } catch {
      return false
    }
  }
}
```

### A03 - Injection (SQL, NoSQL, LDAP)

```typescript
// lib/security/injection-prevention.ts
import { z } from 'zod'

/**
 * Schémas de validation stricts pour prévenir les injections
 */
export const ValidationSchemas = {
  // Validation SQL-safe
  sqlSafeString: z.string()
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Caractères non autorisés détectés')
    .max(255, 'Chaîne trop longue'),
  
  // ID numérique uniquement
  numericId: z.coerce.number()
    .int('ID doit être un entier')
    .positive('ID doit être positif')
    .max(2147483647, 'ID trop grand'),
  
  // UUID strict
  uuid: z.string()
    .uuid('Format UUID invalide'),
  
  // Email strict
  email: z.string()
    .email('Format email invalide')
    .max(320, 'Email trop long')
    .toLowerCase(),
  
  // Nom utilisateur alphanumérique
  username: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nom d\'utilisateur invalide')
    .min(3, 'Minimum 3 caractères')
    .max(30, 'Maximum 30 caractères'),
  
  // Recherche sécurisée
  searchQuery: z.string()
    .regex(/^[a-zA-Z0-9\s\-'".]+$/, 'Caractères de recherche non autorisés')
    .max(100, 'Requête trop longue')
    .trim()
}

/**
 * Query Builder sécurisé avec préparation des requêtes
 */
export class SecureQueryBuilder {
  
  /**
   * Construction de requête SELECT sécurisée
   */
  public static buildSelectQuery(
    table: string,
    columns: string[],
    conditions: Record<string, any> = {},
    orderBy?: string,
    limit?: number
  ): { query: string; params: any[] } {
    
    // Validation table name (allowlist)
    const allowedTables = ['users', 'products', 'orders', 'markets', 'articles']
    if (!allowedTables.includes(table)) {
      throw new Error(`Table non autorisée: ${table}`)
    }
    
    // Validation colonnes (allowlist)
    const allowedColumns = this.getAllowedColumns(table)
    const validColumns = columns.filter(col => allowedColumns.includes(col))
    
    if (validColumns.length === 0) {
      throw new Error('Aucune colonne valide spécifiée')
    }
    
    // Construction requête
    let query = `SELECT ${validColumns.join(', ')} FROM ${table}`
    const params: any[] = []
    let paramIndex = 1
    
    // Conditions WHERE
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .filter(key => allowedColumns.includes(key))
        .map(key => {
          params.push(conditions[key])
          return `${key} = $${paramIndex++}`
        })
        .join(' AND ')
      
      if (whereClause) {
        query += ` WHERE ${whereClause}`
      }
    }
    
    // ORDER BY sécurisé
    if (orderBy && allowedColumns.includes(orderBy)) {
      query += ` ORDER BY ${orderBy}`
    }
    
    // LIMIT sécurisé
    if (limit && typeof limit === 'number' && limit > 0 && limit <= 1000) {
      query += ` LIMIT ${limit}`
    }
    
    return { query, params }
  }
  
  private static getAllowedColumns(table: string): string[] {
    const columnMap: Record<string, string[]> = {
      users: ['id', 'email', 'name', 'created_at', 'updated_at'],
      products: ['id', 'name', 'description', 'price', 'status', 'created_at'],
      orders: ['id', 'user_id', 'total', 'status', 'created_at'],
      markets: ['id', 'name', 'location', 'schedule', 'active'],
      articles: ['id', 'title', 'excerpt', 'status', 'published_at']
    }
    
    return columnMap[table] || []
  }
}

/**
 * Sanitisation des entrées utilisateur
 */
export class InputSanitizer {
  
  /**
   * Nettoyage HTML avec allowlist
   */
  public static sanitizeHTML(input: string): string {
    const DOMPurify = require('dompurify')
    const { JSDOM } = require('jsdom')
    
    const window = new JSDOM('').window
    const purify = DOMPurify(window)
    
    // Configuration stricte
    return purify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      ALLOW_DATA_ATTR: false
    })
  }
  
  /**
   * Échappement pour contexte SQL
   */
  public static escapeSQLString(input: string): string {
    return input.replace(/'/g, "''")
  }
  
  /**
   * Validation et nettoyage JSON
   */
  public static sanitizeJSON(input: any): any {
    // Conversion en string puis parsing pour éviter les prototypes pollution
    const jsonString = JSON.stringify(input)
    
    // Validation taille
    if (jsonString.length > 10000) {
      throw new Error('Données JSON trop volumineuses')
    }
    
    // Re-parsing sécurisé
    return JSON.parse(jsonString)
  }
  
  /**
   * Nettoyage paramètres de recherche
   */
  public static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>\"']/g, '') // Suppression caractères dangereux
      .replace(/\s+/g, ' ') // Normalisation espaces
      .substring(0, 100) // Limitation taille
  }
}
```

### A05 - Security Misconfiguration

```typescript
// lib/security/headers.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Configuration des headers de sécurité
 */
export class SecurityHeaders {
  
  /**
   * Headers de sécurité complets
   */
  public static getSecurityHeaders(): Record<string, string> {
    return {
      // CSP strict
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.stripe.com https://*.supabase.co",
        "frame-src https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ].join('; '),
      
      // Protection XSS
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '0', // Désactivé car CSP est plus efficace
      
      // HSTS strict
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Politique de referrer
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=(self "https://js.stripe.com")'
      ].join(', '),
      
      // Cross-Origin policies
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    }
  }
  
  /**
   * Middleware d'application des headers
   */
  public static middleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Application des headers de sécurité
    const headers = this.getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Suppression des headers révélateurs
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')
    
    // Headers spécifiques selon l'environnement
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('X-Robots-Tag', 'index, follow')
    } else {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    }
    
    return response
  }
}

// next.config.js sécurisé
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
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
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  }
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration sécurité
  poweredByHeader: false,
  compress: true,
  
  // Headers sécurisés
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  
  // Redirections HTTPS
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Configuration images sécurisée
  images: {
    domains: ['*.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
```

### A07 - Identification and Authentication Failures

```typescript
// lib/auth/session-security.ts

/**
 * Gestion de session sécurisée avec rotation et validation
 */
export class SecureSessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes avant expiration
  
  /**
   * Validation et rafraîchissement de session
   */
  public static async validateAndRefreshSession(
    sessionToken: string
  ): Promise<{ valid: boolean; newToken?: string }> {
    
    const supabase = createSupabaseServerClient()
    
    // Vérification token
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      await this.logSessionEvent('INVALID_SESSION', sessionToken)
      return { valid: false }
    }
    
    // Vérification expiration
    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const timeToExpiry = expiresAt.getTime() - now.getTime()
    
    // Session expirée
    if (timeToExpiry <= 0) {
      await this.logSessionEvent('EXPIRED_SESSION', sessionToken)
      return { valid: false }
    }
    
    // Rafraîchissement nécessaire
    if (timeToExpiry <= this.REFRESH_THRESHOLD) {
      const { data: refreshData, error: refreshError } = 
        await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        await this.logSessionEvent('REFRESH_FAILED', sessionToken)
        return { valid: false }
      }
      
      await this.logSessionEvent('SESSION_REFRESHED', refreshData.session.access_token)
      return { 
        valid: true, 
        newToken: refreshData.session.access_token 
      }
    }
    
    return { valid: true }
  }
  
  /**
   * Détection de sessions concurrentes suspectes
   */
  public static async detectConcurrentSessions(userId: string): Promise<boolean> {
    const supabase = createAdminClient()
    
    // Récupération des sessions actives
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
    
    if (!sessions || sessions.length <= 1) {
      return false // Pas de sessions multiples
    }
    
    // Analyse des patterns suspects
    const ipAddresses = new Set(sessions.map(s => s.ip_address))
    const userAgents = new Set(sessions.map(s => s.user_agent))
    const countries = new Set(sessions.map(s => s.country))
    
    // Alertes si:
    // - Plus de 3 IPs différentes
    // - Plus de 2 pays différents
    // - Plus de 5 sessions actives
    const suspicious = 
      ipAddresses.size > 3 ||
      countries.size > 2 ||
      sessions.length > 5
    
    if (suspicious) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_CONCURRENT_SESSIONS',
        userId,
        sessionCount: sessions.length,
        ipCount: ipAddresses.size,
        countryCount: countries.size,
        timestamp: new Date().toISOString()
      })
    }
    
    return suspicious
  }
  
  /**
   * Révocation de toutes les sessions utilisateur
   */
  public static async revokeAllUserSessions(
    userId: string,
    reason: string
  ): Promise<void> {
    const supabase = createAdminClient()
    
    // Révocation côté Supabase
    await supabase.auth.admin.signOut(userId, 'global')
    
    // Suppression des sessions en base
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
    
    // Log de sécurité
    await this.logSecurityEvent({
      type: 'ALL_SESSIONS_REVOKED',
      userId,
      reason,
      timestamp: new Date().toISOString()
    })
  }
  
  private static async logSessionEvent(
    event: string,
    sessionToken: string,
    metadata?: any
  ): Promise<void> {
    // Implementation du logging de session
    console.log(`Session Event: ${event}`, { sessionToken, metadata })
  }
}

/**
 * Authentification multi-facteurs (2FA)
 */
export class TwoFactorAuth {
  
  /**
   * Génération de code de sauvegarde
   */
  public static generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => 
      TokenGenerator.generateSecureToken(4).toUpperCase()
    )
  }
  
  /**
   * Validation code de sauvegarde
   */
  public static async validateBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const supabase = createAdminClient()
    
    // Récupération et suppression du code (usage unique)
    const { data, error } = await supabase
      .from('user_backup_codes')
      .delete()
      .eq('user_id', userId)
      .eq('code', code.toUpperCase())
      .select()
      .single()
    
    if (error || !data) {
      await this.logSecurityEvent({
        type: 'INVALID_BACKUP_CODE',
        userId,
        code: code.substring(0, 2) + '***', // Masquage partiel
        timestamp: new Date().toISOString()
      })
      return false
    }
    
    await this.logSecurityEvent({
      type: 'BACKUP_CODE_USED',
      userId,
      codeId: data.id,
      timestamp: new Date().toISOString()
    })
    
    return true
  }
}
```

### A10 - Server-Side Request Forgery (SSRF)

```typescript
// lib/security/ssrf-protection.ts
import { URL } from 'url'

/**
 * Protection contre les attaques SSRF
 */
export class SSRFProtection {
  
  // Allowlist des domaines autorisés
  private static readonly ALLOWED_DOMAINS = [
    'api.stripe.com',
    'js.stripe.com',
    '*.supabase.co',
    'www.herbisveritas.fr'
  ]
  
  // Blocklist des ranges d'IP privées/locales
  private static readonly BLOCKED_IP_RANGES = [
    '10.0.0.0/8',      // RFC 1918
    '172.16.0.0/12',   // RFC 1918
    '192.168.0.0/16',  // RFC 1918
    '127.0.0.0/8',     // Loopback
    '169.254.0.0/16',  // Link-local
    '::1/128',         // IPv6 loopback
    'fc00::/7',        // IPv6 ULA
    '0.0.0.0/32',      // Invalid
    '224.0.0.0/4',     // Multicast
  ]
  
  /**
   * Validation d'URL pour les requêtes sortantes
   */
  public static async validateOutgoingURL(urlString: string): Promise<boolean> {
    try {
      const url = new URL(urlString)
      
      // Vérification protocole
      if (!['https:', 'http:'].includes(url.protocol)) {
        return false
      }
      
      // Vérification domaine autorisé
      if (!this.isDomainAllowed(url.hostname)) {
        return false
      }
      
      // Résolution DNS et vérification IP
      const ipAddress = await this.resolveHostname(url.hostname)
      if (!ipAddress || this.isBlockedIP(ipAddress)) {
        return false
      }
      
      return true
      
    } catch (error) {
      return false
    }
  }
  
  /**
   * Wrapper sécurisé pour fetch
   */
  public static async secureFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    
    // Validation URL
    const isValid = await this.validateOutgoingURL(url)
    if (!isValid) {
      throw new Error('URL non autorisée ou suspecte')
    }
    
    // Configuration sécurisée
    const secureOptions: RequestInit = {
      ...options,
      // Timeout obligatoire
      signal: AbortSignal.timeout(10000), // 10 secondes max
      // Headers sécurisés
      headers: {
        'User-Agent': 'HerbisVeritas-Bot/1.0',
        ...options.headers,
      },
      // Redirection limitée
      redirect: 'manual'
    }
    
    // Log de la requête
    await this.logOutgoingRequest(url, secureOptions)
    
    try {
      const response = await fetch(url, secureOptions)
      
      // Validation response
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      
      // Vérification Content-Type
      const contentType = response.headers.get('content-type')
      if (!this.isAllowedContentType(contentType)) {
        throw new Error('Type de contenu non autorisé')
      }
      
      return response
      
    } catch (error) {
      await this.logSecurityEvent({
        type: 'OUTGOING_REQUEST_FAILED',
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      throw error
    }
  }
  
  private static isDomainAllowed(hostname: string): boolean {
    return this.ALLOWED_DOMAINS.some(allowed => {
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2)
        return hostname.endsWith(domain)
      }
      return hostname === allowed
    })
  }
  
  private static async resolveHostname(hostname: string): Promise<string | null> {
    const dns = await import('dns')
    const { promisify } = await import('util')
    const lookup = promisify(dns.lookup)
    
    try {
      const { address } = await lookup(hostname)
      return address
    } catch {
      return null
    }
  }
  
  private static isBlockedIP(ip: string): boolean {
    const { isIP, isIPv4, isIPv6 } = require('net')
    
    if (!isIP(ip)) {
      return true
    }
    
    // Vérification contre les ranges bloquées
    // Implementation simplifiée - en production utiliser une lib comme ip-range-check
    return this.BLOCKED_IP_RANGES.some(range => {
      if (range.includes('/')) {
        // CIDR check (implémentation simplifiée)
        return this.isIPInCIDR(ip, range)
      }
      return ip === range
    })
  }
  
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    // Implémentation simplifiée - utiliser une bibliothèque comme netmask en production
    const [network, prefixLength] = cidr.split('/')
    // Logique de vérification CIDR
    return false // Placeholder
  }
  
  private static isAllowedContentType(contentType: string | null): boolean {
    if (!contentType) return false
    
    const allowedTypes = [
      'application/json',
      'text/plain',
      'application/xml',
      'text/xml'
    ]
    
    return allowedTypes.some(type => contentType.startsWith(type))
  }
  
  private static async logOutgoingRequest(
    url: string,
    options: RequestInit
  ): Promise<void> {
    // Log des requêtes sortantes pour monitoring
    console.log(`Outgoing request: ${url}`, {
      method: options.method || 'GET',
      timestamp: new Date().toISOString()
    })
  }
}
```

---

## 🔍 Audit et Logging de Sécurité

### Système de Journalisation des Événements de Sécurité

```typescript
// lib/security/audit-logging.ts

export interface SecurityEvent {
  id?: string
  type: SecurityEventType
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  status: 'success' | 'failure' | 'warning'
  details?: Record<string, any>
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export type SecurityEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE' 
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'ADMIN_ACTION'
  | 'SECURITY_VIOLATION'
  | 'BRUTE_FORCE_ATTEMPT'
  | 'CSRF_TOKEN_MISMATCH'
  | 'XSS_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'

/**
 * Service de logging de sécurité avec alerting
 */
export class SecurityAuditLogger {
  
  /**
   * Enregistrement d'événement de sécurité
   */
  public static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const completeEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    }
    
    // Sauvegarde en base de données
    await this.persistEvent(completeEvent)
    
    // Alerting selon la criticité
    if (completeEvent.severity === 'critical' || completeEvent.severity === 'high') {
      await this.sendSecurityAlert(completeEvent)
    }
    
    // Indexation pour recherche rapide
    await this.indexEvent(completeEvent)
    
    // Logging console en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🛡️ Security Event:', completeEvent)
    }
  }
  
  /**
   * Détection d'anomalies en temps réel
   */
  public static async analyzeSecurityPatterns(userId?: string): Promise<void> {
    const timeWindow = 15 * 60 * 1000 // 15 minutes
    const now = Date.now()
    const since = new Date(now - timeWindow).toISOString()
    
    const supabase = createAdminClient()
    
    let query = supabase
      .from('security_events')
      .select('*')
      .gte('timestamp', since)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: recentEvents } = await query
    
    if (!recentEvents) return
    
    // Détection patterns suspects
    const patterns = this.detectSuspiciousPatterns(recentEvents)
    
    for (const pattern of patterns) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: pattern.userId,
        severity: pattern.severity,
        status: 'warning',
        details: pattern.details
      })
    }
  }
  
  /**
   * Génération de rapports de sécurité
   */
  public static async generateSecurityReport(
    startDate: string,
    endDate: string
  ): Promise<SecurityReport> {
    const supabase = createAdminClient()
    
    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false })
    
    if (!events) {
      throw new Error('Impossible de récupérer les événements de sécurité')
    }
    
    const report: SecurityReport = {
      period: { start: startDate, end: endDate },
      totalEvents: events.length,
      eventsByType: this.groupEventsByType(events),
      eventsBySeverity: this.groupEventsBySeverity(events),
      topUsers: this.getTopUsersByEvents(events),
      securityTrends: this.calculateSecurityTrends(events),
      recommendations: this.generateRecommendations(events)
    }
    
    return report
  }
  
  private static async persistEvent(event: SecurityEvent): Promise<void> {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('security_events')
      .insert({
        id: event.id,
        type: event.type,
        user_id: event.userId,
        session_id: event.sessionId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        resource: event.resource,
        action: event.action,
        status: event.status,
        details: event.details,
        timestamp: event.timestamp,
        severity: event.severity
      })
    
    if (error) {
      console.error('Erreur sauvegarde événement sécurité:', error)
      // Fallback vers fichier log
      await this.logToFile(event)
    }
  }
  
  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Notification Slack/Discord/Email selon configuration
    const alertMessage = this.formatAlertMessage(event)
    
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(alertMessage)
    }
    
    if (process.env.ADMIN_EMAIL) {
      await this.sendEmailAlert(event)
    }
  }
  
  private static detectSuspiciousPatterns(events: SecurityEvent[]): SuspiciousPattern[] {
    const patterns: SuspiciousPattern[] = []
    
    // Groupement par utilisateur
    const eventsByUser = new Map<string, SecurityEvent[]>()
    events.forEach(event => {
      if (!event.userId) return
      
      if (!eventsByUser.has(event.userId)) {
        eventsByUser.set(event.userId, [])
      }
      eventsByUser.get(event.userId)!.push(event)
    })
    
    // Analyse par utilisateur
    eventsByUser.forEach((userEvents, userId) => {
      // Tentatives de connexion multiples
      const loginFailures = userEvents.filter(e => e.type === 'LOGIN_FAILURE')
      if (loginFailures.length >= 5) {
        patterns.push({
          type: 'BRUTE_FORCE',
          userId,
          severity: 'high' as const,
          details: {
            failedAttempts: loginFailures.length,
            timeSpan: this.getTimeSpan(loginFailures)
          }
        })
      }
      
      // Accès depuis multiples IP
      const ipAddresses = new Set(userEvents.map(e => e.ipAddress).filter(Boolean))
      if (ipAddresses.size >= 3) {
        patterns.push({
          type: 'MULTIPLE_IPS',
          userId,
          severity: 'medium' as const,
          details: {
            ipCount: ipAddresses.size,
            ips: Array.from(ipAddresses)
          }
        })
      }
    })
    
    return patterns
  }
  
  private static async logToFile(event: SecurityEvent): Promise<void> {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const logDir = path.join(process.cwd(), 'logs')
    const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`)
    
    try {
      await fs.mkdir(logDir, { recursive: true })
      await fs.appendFile(logFile, JSON.stringify(event) + '\n')
    } catch (error) {
      console.error('Erreur écriture log fichier:', error)
    }
  }
}

interface SecurityReport {
  period: { start: string; end: string }
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  topUsers: Array<{ userId: string; eventCount: number }>
  securityTrends: Array<{ date: string; eventCount: number }>
  recommendations: string[]
}

interface SuspiciousPattern {
  type: string
  userId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: Record<string, any>
}
```

---

## 🚨 Incident Response et Recovery

### Plan de Réponse aux Incidents de Sécurité

```typescript
// lib/security/incident-response.ts

export interface SecurityIncident {
  id: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  affectedSystems: string[]
  affectedUsers: string[]
  detectedAt: string
  reportedBy: string
  assignedTo?: string
  mitigationSteps: string[]
  resolution?: string
  resolvedAt?: string
  lessons: string[]
}

export type IncidentType = 
  | 'DATA_BREACH'
  | 'UNAUTHORIZED_ACCESS'
  | 'MALWARE'
  | 'DDOS_ATTACK'
  | 'PHISHING'
  | 'INSIDER_THREAT'
  | 'SYSTEM_COMPROMISE'
  | 'SOCIAL_ENGINEERING'

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'investigating' | 'mitigating' | 'resolved' | 'closed'

/**
 * Service de gestion des incidents de sécurité
 */
export class IncidentResponseManager {
  
  /**
   * Création automatique d'incident selon les seuils
   */
  public static async createIncidentFromEvents(
    events: SecurityEvent[]
  ): Promise<void> {
    
    // Analyse des events pour détection d'incidents
    const incidents = this.analyzeEventsForIncidents(events)
    
    for (const incident of incidents) {
      await this.createIncident(incident)
    }
  }
  
  /**
   * Création d'incident de sécurité
   */
  public static async createIncident(
    incidentData: Omit<SecurityIncident, 'id' | 'detectedAt' | 'status'>
  ): Promise<string> {
    
    const incident: SecurityIncident = {
      id: crypto.randomUUID(),
      detectedAt: new Date().toISOString(),
      status: 'open',
      ...incidentData
    }
    
    // Sauvegarde en base
    await this.persistIncident(incident)
    
    // Notifications immédiates selon la criticité
    await this.triggerIncidentNotifications(incident)
    
    // Actions automatiques de mitigation
    await this.executeAutomaticMitigation(incident)
    
    return incident.id
  }
  
  /**
   * Actions automatiques de mitigation
   */
  private static async executeAutomaticMitigation(
    incident: SecurityIncident
  ): Promise<void> {
    
    switch (incident.type) {
      case 'UNAUTHORIZED_ACCESS':
        if (incident.severity === 'critical' || incident.severity === 'high') {
          // Révocation sessions utilisateurs affectés
          for (const userId of incident.affectedUsers) {
            await SecurityAuditLogger.revokeAllUserSessions(
              userId, 
              `Incident de sécurité: ${incident.id}`
            )
          }
          
          // Blocage temporaire des comptes
          await this.temporarilyLockAccounts(incident.affectedUsers)
        }
        break
        
      case 'DDOS_ATTACK':
        // Activation du mode de protection DDoS
        await this.enableDDoSProtection()
        break
        
      case 'DATA_BREACH':
        // Isolation immédiate des systèmes affectés
        await this.isolateAffectedSystems(incident.affectedSystems)
        
        // Notification authorities selon RGPD
        await this.notifyDataProtectionAuthority(incident)
        break
        
      case 'MALWARE':
        // Quarantaine des systèmes
        await this.quarantineAffectedSystems(incident.affectedSystems)
        break
    }
  }
  
  /**
   * Plan de continuité d'activité
   */
  public static async activateBusinessContinuityPlan(
    incidentId: string
  ): Promise<void> {
    
    const incident = await this.getIncident(incidentId)
    if (!incident) return
    
    // Basculement vers systèmes de secours
    if (incident.severity === 'critical') {
      await this.activateFailoverSystems()
    }
    
    // Communication aux utilisateurs
    await this.communicateServiceStatus(incident)
    
    // Activation équipe d'urgence
    await this.activateEmergencyTeam(incident)
  }
  
  /**
   * Recovery et restoration des services
   */
  public static async initiateRecoveryProcedure(
    incidentId: string
  ): Promise<void> {
    
    const incident = await this.getIncident(incidentId)
    if (!incident) return
    
    // Vérification de l'élimination de la menace
    const threatEliminated = await this.verifyThreatElimination(incident)
    
    if (!threatEliminated) {
      throw new Error('La menace n\'a pas été complètement éliminée')
    }
    
    // Restoration progressive des services
    const recoveryPlan = this.createRecoveryPlan(incident)
    
    for (const step of recoveryPlan.steps) {
      await this.executeRecoveryStep(step)
      
      // Validation après chaque étape
      const validation = await this.validateRecoveryStep(step)
      
      if (!validation.success) {
        throw new Error(`Échec étape recovery: ${validation.error}`)
      }
    }
    
    // Monitoring post-incident renforcé
    await this.enableEnhancedMonitoring(incident)
  }
  
  /**
   * Post-incident analysis et leçons apprises
   */
  public static async conductPostIncidentReview(
    incidentId: string
  ): Promise<PostIncidentReport> {
    
    const incident = await this.getIncident(incidentId)
    if (!incident) {
      throw new Error('Incident introuvable')
    }
    
    // Timeline reconstruction
    const timeline = await this.reconstructIncidentTimeline(incident)
    
    // Root cause analysis
    const rootCause = await this.performRootCauseAnalysis(incident)
    
    // Impact assessment
    const impact = await this.assessIncidentImpact(incident)
    
    // Recommendations
    const recommendations = this.generateRecommendations(incident, rootCause)
    
    const report: PostIncidentReport = {
      incidentId: incident.id,
      summary: incident.description,
      timeline,
      rootCause,
      impact,
      mitigationEffectiveness: this.assessMitigationEffectiveness(incident),
      lessonsLearned: incident.lessons,
      recommendations,
      preventiveMeasures: this.identifyPreventiveMeasures(rootCause),
      createdAt: new Date().toISOString()
    }
    
    // Sauvegarde du rapport
    await this.savePostIncidentReport(report)
    
    return report
  }
  
  private static analyzeEventsForIncidents(
    events: SecurityEvent[]
  ): Array<Omit<SecurityIncident, 'id' | 'detectedAt' | 'status'>> {
    const incidents: Array<Omit<SecurityIncident, 'id' | 'detectedAt' | 'status'>> = []
    
    // Groupement par patterns temporels
    const timeWindows = this.groupEventsByTimeWindow(events, 5 * 60 * 1000) // 5 minutes
    
    for (const window of timeWindows) {
      // Détection brute force
      const loginFailures = window.filter(e => e.type === 'LOGIN_FAILURE')
      if (loginFailures.length >= 10) {
        incidents.push({
          type: 'UNAUTHORIZED_ACCESS',
          severity: 'high',
          title: 'Tentative de force brute détectée',
          description: `${loginFailures.length} tentatives de connexion échouées en 5 minutes`,
          affectedSystems: ['authentication'],
          affectedUsers: Array.from(new Set(loginFailures.map(e => e.userId).filter(Boolean))),
          reportedBy: 'system',
          mitigationSteps: [
            'Blocage temporaire des comptes',
            'Révocation des sessions',
            'Renforcement monitoring'
          ],
          lessons: []
        })
      }
      
      // Détection accès données sensibles
      const dataAccess = window.filter(e => 
        e.type === 'DATA_ACCESS' && 
        e.details?.sensitive === true
      )
      
      if (dataAccess.length >= 5) {
        incidents.push({
          type: 'DATA_BREACH',
          severity: 'critical',
          title: 'Accès suspect aux données sensibles',
          description: `${dataAccess.length} accès à des données sensibles par ${dataAccess[0]?.userId}`,
          affectedSystems: Array.from(new Set(dataAccess.map(e => e.resource).filter(Boolean))),
          affectedUsers: Array.from(new Set(dataAccess.map(e => e.userId).filter(Boolean))),
          reportedBy: 'system',
          mitigationSteps: [
            'Isolation des systèmes affectés',
            'Audit des accès',
            'Notification CNIL si nécessaire'
          ],
          lessons: []
        })
      }
    }
    
    return incidents
  }
}

interface PostIncidentReport {
  incidentId: string
  summary: string
  timeline: IncidentTimelineEvent[]
  rootCause: RootCauseAnalysis
  impact: IncidentImpact
  mitigationEffectiveness: string
  lessonsLearned: string[]
  recommendations: string[]
  preventiveMeasures: string[]
  createdAt: string
}

interface IncidentTimelineEvent {
  timestamp: string
  action: string
  actor: string
  details: string
}

interface RootCauseAnalysis {
  primaryCause: string
  contributingFactors: string[]
  systemsInvolved: string[]
  humanFactors: string[]
}

interface IncidentImpact {
  usersAffected: number
  systemsDown: number
  dataCompromised: boolean
  financialCost: number
  reputationalImpact: 'low' | 'medium' | 'high'
  downtimeMinutes: number
}
```

---

## 🔧 Configuration de Sécurité de Déploiement

### Configuration Supabase Production

```sql
-- Configuration sécuritaire de la base de données

-- Activation RLS sur toutes les tables sensibles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Configuration des connexions
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Configuration SSL/TLS
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';

-- Configuration audit logging
ALTER SYSTEM SET log_statement = 'mod';  -- Log toutes les modifications
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log requêtes > 1s
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_checkpoints = on;

-- Rôles et permissions strictes
CREATE ROLE app_readonly;
GRANT CONNECT ON DATABASE herbisveritas TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

CREATE ROLE app_readwrite;
GRANT CONNECT ON DATABASE herbisveritas TO app_readwrite;
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE ON products, orders, profiles TO app_readwrite;

-- Fonction de validation des emails sécurisée
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 320
    AND email NOT LIKE '%@localhost%'
    AND email NOT LIKE '%@127.0.0.1%';
END;
$$;
```

### Configuration Vercel Sécurisée

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "regions": ["cdg1"], // Région Europe pour RGPD
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/*/route.js": {
      "maxDuration": 10
    }
  }
}
```

### Variables d'Environnement Sécurisées

```bash
# .env.production (exemple - ne pas committer)

# URLs sécurisées
NEXT_PUBLIC_SITE_URL=https://herbisveritas.fr
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clés de chiffrement (générer avec openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-encryption-key
JWT_SECRET=your-jwt-secret-key
CSRF_SECRET=your-csrf-secret-key

# Configuration Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring et alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
ADMIN_EMAIL=admin@herbisveritas.fr

# Configuration Redis pour rate limiting
REDIS_URL=redis://user:pass@host:port

# Configuration SMTP sécurisée
SMTP_HOST=smtp.herbisveritas.fr
SMTP_PORT=587
SMTP_USER=noreply@herbisveritas.fr
SMTP_PASS=your-smtp-password
SMTP_FROM=HerbisVeritas <noreply@herbisveritas.fr>

# Configuration de sécurité
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
SESSION_TIMEOUT_MS=1800000
MAX_FILE_SIZE_MB=5
ALLOWED_UPLOAD_TYPES=image/jpeg,image/png,image/webp
```

---

## 📋 Checklist de Sécurité

### Pré-Déploiement

```markdown
## 🔒 Checklist Sécurité Pre-Production

### Authentication & Authorization
- [ ] Politique de mots de passe conforme OWASP
- [ ] Rate limiting sur endpoints de connexion
- [ ] Sessions sécurisées avec rotation
- [ ] RLS activé sur toutes les tables sensibles
- [ ] Permissions utilisateur minimales
- [ ] Audit trail complet des actions sensibles

### Input Validation & Output Encoding  
- [ ] Validation Zod sur toutes les entrées utilisateur
- [ ] Sanitization HTML avec allowlist stricte
- [ ] Protection contre injection SQL via requêtes préparées
- [ ] Validation côté serveur pour tous les formulaires
- [ ] Encoding des sorties selon le contexte

### Security Headers
- [ ] Content Security Policy (CSP) strict
- [ ] HSTS avec preload activé
- [ ] X-Frame-Options configuré
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy strict
- [ ] Permissions-Policy configuré

### Data Protection
- [ ] Chiffrement AES-256 pour données sensibles
- [ ] Hachage bcrypt pour mots de passe
- [ ] Variables d'environnement sécurisées
- [ ] Pas de secrets dans le code source
- [ ] Sauvegarde chiffrée

### Network Security
- [ ] HTTPS obligatoire (TLS 1.2+)
- [ ] WAF configuré et actif
- [ ] Rate limiting global activé
- [ ] Protection DDoS configurée
- [ ] Monitoring réseau actif

### Monitoring & Logging
- [ ] Logs de sécurité centralisés
- [ ] Monitoring temps réel des anomalies
- [ ] Alertes automatiques pour incidents
- [ ] Backup des logs sécurisé
- [ ] Plan de réponse aux incidents documenté

### Infrastructure
- [ ] Images Docker sécurisées et à jour
- [ ] Secrets managés via gestionnaire dédié
- [ ] Accès infrastructure en 2FA
- [ ] Ségrégation des environnements
- [ ] Monitoring infrastructure actif

### Compliance
- [ ] Conformité RGPD documentée
- [ ] Politique de confidentialité à jour
- [ ] Consentement utilisateur géré
- [ ] Droit à l'effacement implémenté
- [ ] Notification de breach configurée
```

---

Cette documentation de sécurité complète fournit un cadre solide pour protéger HerbisVeritas V2 contre les principales menaces cybersécuritaires, en suivant les standards OWASP et les meilleures pratiques industrielles.