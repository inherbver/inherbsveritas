# HerbisVeritas V2 - Product Requirements Document (PRD)

## 📋 Document Overview

**Version**: 2.0  
**Date**: Janvier 2025  
**Status**: Draft  
**Author**: Technical Team  
**Approvers**: Product Owner, Technical Lead  

---

## 📝 Executive Summary

HerbisVeritas V2 représente une refonte complète de la plateforme e-commerce existante, migrant d'une architecture Supabase complexe vers une solution moderne basée sur Play Next.js avec Supabase comme backend. Cette migration vise à simplifier la maintenance, améliorer les performances, et fournir une expérience utilisateur optimale.

### Key Objectives MVP
- 🎯 **Architecture MVP**: Passage de 25+ tables vers **13 tables essentielles validées**
- 🚀 **Performance**: Amélioration des temps de chargement < 2s
- 🛠️ **Maintenabilité**: Labels HerbisVeritas + INCI + TipTap éditeur
- 🌐 **i18n MVP**: Support FR/EN (DE/ES → V2)
- ⚡ **Launch Ready**: 12 semaines, budget maîtrisé €106k

---

## 🎯 Product Vision & Goals

### Vision Statement
"Créer la plateforme e-commerce française de référence pour les produits naturels et biologiques, alliant simplicité d'utilisation, performance technique et expérience client exceptionnelle."

### Business Goals
- **Croissance**: Augmenter les conversions de 25% grâce à une UX améliorée
- **Efficacité**: Réduire les coûts de développement de 40% via l'architecture simplifiée
- **Scalabilité**: Supporter 10x plus d'utilisateurs simultanés
- **Internationalisation MVP**: Support FR/EN pour lancement, DE/ES en V2

### Success Metrics
- **Performance**: Temps de chargement < 2s (actuellement 4-5s)
- **Conversion**: Taux de conversion panier > 15% (actuellement 10%)
- **Maintenance**: Temps de développement nouvelles features -50%
- **Qualité**: 0 bugs critiques en production, couverture tests > 80%

---

## 👥 Target Users & Personas

### Primary Users

#### 1. **Consommateurs Bio/Naturel** (80% du trafic)
- **Profil**: 25-50 ans, sensibles à l'écologie, pouvoir d'achat moyen-élevé
- **Besoins**: Produits authentiques, informations détaillées, livraison rapide
- **Frustrations Actuelles**: Site lent, panier qui bug, process checkout compliqué

#### 2. **Professionnels/Revendeurs** (15% du trafic)  
- **Profil**: Boutiques bio, thérapeutes, esthéticiennes
- **Besoins**: Prix de gros, commandes récurrentes, facturation B2B
- **Frustrations Actuelles**: Pas de compte pro, pas de remises volume

#### 3. **Administrateurs Internes** (5% du trafic)
- **Profil**: Équipe HerbisVeritas, gestionnaires de contenu
- **Besoins**: Gestion catalogue, commandes, contenus, analytics
- **Frustrations Actuelles**: Interface admin complexe, fonctions manquantes

---

## 🏗️ Technical Architecture

### Current State Analysis
Basé sur l'analyse de la base de données existante (23 tables), l'architecture actuelle souffre de:
- **Sur-complexité**: Schéma DB trop complexe pour les besoins réels
- **Maintenance difficile**: Code fragmenté, patterns inconsistants
- **Performance**: Requêtes lourdes, N+1 queries
- **Évolutivité**: Ajout de features très coûteux

### Target Architecture: Play Next.js + Supabase

#### Stack Technologique & Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ Next.js 15      │◄──►│ Server Actions  │◄──►│ Supabase        │
│ App Router      │    │ + Edge Runtime  │    │ PostgreSQL      │
│ TypeScript      │    │ Zod Validation  │    │ RLS Policies    │
│ Tailwind CSS    │    │ Stripe          │    │ Auth System     │
│ shadcn/ui       │    │ Next-intl       │    │ Realtime        │
│ React 19        │    │ Middleware      │    │ Storage         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Relations Architecturales Optimales:**

1. **Simplicité End-to-End**
```
Frontend ──► Server Components ──► Supabase ──► PostgreSQL
    └────► Server Actions ─────────┘
```

2. **Performance Native**
```typescript
// Lecture (Server Components) - Pas d'API overhead
export default async function ProductsPage() {
  const products = await supabase.from('products').select('*')
  return <ProductGrid products={products} />
}

// Écriture (Server Actions) - Validation intégrée  
export async function addProductAction(formData: FormData) {
  'use server'
  const data = ProductSchema.parse(formData) // Zod validation
  const result = await supabase.from('products').insert(data)
  revalidatePath('/admin/products')
  return result
}
```

3. **Sécurité Multicouche**
```sql
-- Database Level (RLS)
CREATE POLICY "Users see own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```
```typescript
// Application Level (Server Actions)
export const updateProduct = withPermissionSafe(
  'products:update',
  async (id: string, data: UpdateProductData) => {
    // Business logic + validation
  }
)
```

**Core Technology Stack:**
```typescript
// Frontend
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)

// Backend & Database  
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Server Actions + Edge Runtime
- Row Level Security (RLS)

// Payments & External
- Stripe (paiements)
- next-intl (internationalisation) 
- Resend (emails)

// DevOps
- Vercel (hosting)
- GitHub Actions (CI/CD)
- Sentry (monitoring)
```

**Flow de Données Idéal:**
```
┌─ Lecture ──────────────────────────────────────────┐
│ Database → Supabase Client → Server Component → UI │
└────────────────────────────────────────────────────┘

┌─ Écriture ─────────────────────────────────────────┐
│ UI → Server Action → Validation → Supabase → DB    │
│            ↓                                       │
│      Permission Check                              │
└────────────────────────────────────────────────────┘

┌─ Temps Réel ───────────────────────────────────────┐
│ DB → Supabase Realtime → Client → UI Update        │
└────────────────────────────────────────────────────┘
```

**Avantages de cette Architecture:**
- **DX Exceptionnelle**: Pas de boilerplate API, type safety end-to-end
- **Performance**: Server Components + Edge Runtime + CDN
- **Sécurité**: RLS + Server-side validation + audit trails
- **Évolutivité**: Supabase scale automatiquement
- **Maintenabilité**: Stack cohérente, patterns clairs

#### Simplified Database Schema
Migration de 23 tables vers 12 tables essentielles:

```sql
-- CORE ENTITIES (6 tables)
users                 -- Profils utilisateurs simplifiés
products             -- Catalogue produits 
orders               -- Commandes
order_items          -- Articles commande
addresses            -- Adresses livraison/facturation
categories           -- Catégories produits

-- CONTENT & BUSINESS (4 tables)
articles             -- Blog/Magazine
markets              -- Événements/Marchés  
partners             -- Partenaires
newsletter           -- Abonnés newsletter

-- SYSTEM (2 tables)
audit_logs          -- Logs sécurité
cart_sessions       -- Sessions panier simplifiées
```

#### Architecture Patterns

**1. Server Components First**
```typescript
// Pages = Server Components par défaut
export default async function ProductsPage() {
  const products = await getProducts() // Server-side
  return <ProductList products={products} />
}

// Interactivité = Client Components ciblés
'use client'
export function AddToCartButton({ productId }) {
  // Client-side interactions only
}
```

**2. Supabase Integration Pattern**
```typescript
// Server-side queries (pages, API routes)
import { createServerClient } from '@/lib/supabase/server'

export async function getProducts() {
  const supabase = createServerClient()
  const { data } = await supabase.from('products').select('*')
  return data
}

// Client-side queries (components)
import { createClient } from '@/lib/supabase/client'

export function useProducts() {
  const [products, setProducts] = useState([])
  const supabase = createClient()
  // Real-time subscriptions, mutations
}
```

**3. Type-Safe Operations**
```typescript
// Supabase types auto-generated
import { Database } from '@/types/database'
type Product = Database['public']['Tables']['products']['Row']
type CreateProduct = Database['public']['Tables']['products']['Insert']

// Type-safe queries
const products: Product[] = await supabase
  .from('products')
  .select('*')
  .returns<Product[]>()
```

---

## 🛒 Feature Specifications

### Phase 1: Core E-commerce (MVP)

#### 1.1 Product Catalog
**Priority**: 🔴 Critical

**Features**:
- **Product Listing**: Grid/list views with filtering and search
- **Product Details**: Rich media, descriptions, INCI lists, availability
- **Categories**: Hierarchical product categorization
- **Search**: Real-time search with autocomplete
- **Filters**: Price, category, brand, availability filters

**Technical Implementation**:
```typescript
// Product listing with server-side filtering
export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: { category?: string, search?: string, page?: string }
}) {
  const products = await getProductsWithFilters({
    category: searchParams.category,
    search: searchParams.search,
    page: Number(searchParams.page) || 1,
    limit: 12
  })
  
  return (
    <div className="container mx-auto">
      <ProductFilters />
      <ProductGrid products={products.data} />
      <Pagination 
        currentPage={products.page}
        totalPages={products.totalPages}
      />
    </div>
  )
}

// Real-time inventory updates
function ProductCard({ product }: { product: Product }) {
  const supabase = createClient()
  const [stock, setStock] = useState(product.stock)
  
  useEffect(() => {
    const subscription = supabase
      .channel('product-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${product.id}` },
        (payload) => setStock(payload.new.stock)
      )
      .subscribe()
      
    return () => subscription.unsubscribe()
  }, [product.id])
  
  return (
    <Card>
      <ProductImage src={product.image_url} />
      <ProductInfo product={product} />
      <StockIndicator stock={stock} />
      <AddToCartButton productId={product.id} disabled={stock === 0} />
    </Card>
  )
}
```

**Acceptance Criteria**:
- ✅ Products load in < 2s
- ✅ Search results appear in < 500ms
- ✅ Real-time stock updates
- ✅ Mobile-responsive design
- ✅ SEO-optimized URLs and meta

#### 1.2 Shopping Cart & Checkout
**Priority**: 🔴 Critical

**Features**:
- **Cart Management**: Add/remove/update quantities, persist across sessions
- **Guest Checkout**: Purchase without account creation
- **Multiple Addresses**: Separate billing/shipping addresses
- **Payment Integration**: Stripe with multiple payment methods
- **Order Confirmation**: Email confirmations, order tracking

**Technical Implementation**:
```typescript
// Cart state management with Zustand
interface CartStore {
  items: CartItem[]
  total: number
  addItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  syncWithServer: () => Promise<void>
}

// Server action for checkout
export async function checkoutAction(formData: FormData) {
  'use server'
  
  const supabase = createServerClient()
  const checkoutData = validateCheckoutData(formData)
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'paypal'],
    line_items: checkoutData.items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.product.name },
        unit_amount: item.product.price * 100
      },
      quantity: item.quantity
    })),
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`
  })
  
  // Save order to database
  const order = await supabase.from('orders').insert({
    user_id: checkoutData.userId,
    total_amount: checkoutData.total,
    payment_intent_id: session.payment_intent,
    status: 'pending_payment'
  }).select().single()
  
  // Save order items
  await supabase.from('order_items').insert(
    checkoutData.items.map(item => ({
      order_id: order.data.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_purchase: item.product.price
    }))
  )
  
  return { checkoutUrl: session.url }
}
```

**Acceptance Criteria**:
- ✅ Cart persists across sessions (30 days)
- ✅ Guest checkout conversion > 20%
- ✅ Checkout completion < 60s
- ✅ Payment success rate > 95%
- ✅ Automatic inventory deduction

#### 1.3 User Management
**Priority**: 🟡 Important  

**Features**:
- **Registration/Login**: Email/password uniquement (pas d'OAuth)
- **Profile Management**: Personal info, preferences, addresses
- **Order History**: Order tracking, reorder functionality
- **Account Security**: Password reset, account deactivation

**Technical Implementation**:
```typescript
// Authentication par email uniquement
export async function signUp(email: string, password: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm`,
      data: {
        locale: 'fr' // Default locale
      }
    }
  })
  
  if (error) throw error
  
  // Create user profile
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      created_at: new Date().toISOString()
    })
  }
  
  return data
}

// Login par email/password
export async function signIn(email: string, password: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Protected pages with middleware
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request })
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protect account pages
  if (request.nextUrl.pathname.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}
```

### Phase 2: Content Management

#### 2.1 Blog/Magazine System
**Priority**: 🟡 Important

**Features**:
- **Article Management**: Rich text editor, media upload, SEO optimization
- **Categories & Tags**: Content organization and discovery
- **Publication Workflow**: Draft → Review → Published states
- **Reader Engagement**: Comments, sharing, reading progress

#### 2.2 Multi-language Support  
**Priority**: 🟡 Important

**Features**:
- **4 Languages**: French (default), English, German, Spanish
- **Dynamic Content**: Product names, descriptions, categories
- **Localized URLs**: `/fr/produits` vs `/en/products`
- **Currency/Region**: Euro/France by default, adaptive by region

---

## 👑 Admin Panel Specifications

### Admin Architecture

Based on the CRUD Functions Roadmap analysis, the admin panel will be rebuilt with comprehensive functionality:

#### Admin Access Control
```typescript
// Role-based access control
enum AdminRole {
  ADMIN = 'admin',    // Full access
  EDITOR = 'editor',  // Content management only
  USER = 'user'       // No admin access
}

// Permission-based middleware
export function withAdminPermission(permission: string) {
  return async function(req: NextRequest) {
    const user = await getCurrentUser()
    if (!hasPermission(user, permission)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  }
}
```

### Phase 1: Essential Admin CRUD (MVP)

#### 1. Users Management 🔴 Critical
**Estimated Effort**: 8-12 hours

**MVP Functions**:
```typescript
// User CRUD operations
export interface AdminUserManagement {
  // CREATE
  createUser(data: CreateUserData): Promise<ActionResult<User>>
  inviteUserByEmail(email: string, role: UserRole): Promise<ActionResult<void>>
  
  // READ  
  getUsers(filters: UserFilters): Promise<ActionResult<PaginatedUsers>>
  getUserById(id: string): Promise<ActionResult<UserWithDetails>>
  getUserStats(): Promise<ActionResult<UserStats>>
  exportUsers(filters: UserFilters): Promise<ActionResult<string>> // CSV
  
  // UPDATE
  updateUserProfile(id: string, data: UpdateUserData): Promise<ActionResult<User>>
  updateUserRole(id: string, role: UserRole): Promise<ActionResult<void>>
  resetUserPassword(id: string): Promise<ActionResult<void>>
  
  // DELETE/MODERATION
  suspendUser(id: string, reason: string): Promise<ActionResult<void>>
  reactivateUser(id: string): Promise<ActionResult<void>>
  softDeleteUser(id: string, reason: string): Promise<ActionResult<void>>
  
  // BULK OPERATIONS
  bulkUpdateUserRoles(userIds: string[], role: UserRole): Promise<ActionResult<void>>
  bulkSuspendUsers(userIds: string[], reason: string): Promise<ActionResult<void>>
}
```

**Admin Interface**:
```tsx
// Users management dashboard
export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<UserFilters>({})
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  return (
    <AdminLayout>
      <PageHeader 
        title="Gestion Utilisateurs"
        actions={[
          <Button onClick={() => exportUsers(filters)}>Exporter CSV</Button>,
          <Button onClick={() => openCreateUserModal()}>Nouvel Utilisateur</Button>
        ]}
      />
      
      <UserFilters filters={filters} onChange={setFilters} />
      
      <DataTable
        data={users}
        columns={[
          { key: 'email', label: 'Email', sortable: true },
          { key: 'full_name', label: 'Nom', sortable: true },
          { key: 'role', label: 'Rôle', render: (user) => <RoleBadge role={user.role} /> },
          { key: 'status', label: 'Statut', render: (user) => <StatusBadge status={user.status} /> },
          { key: 'created_at', label: 'Créé le', sortable: true },
          { key: 'actions', label: 'Actions', render: (user) => (
            <UserActionsDropdown user={user} />
          )}
        ]}
        selectable
        selectedIds={selectedUsers}
        onSelectionChange={setSelectedUsers}
      />
      
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          actions={[
            { label: 'Suspendre', onClick: () => bulkSuspendUsers(selectedUsers) },
            { label: 'Changer rôle', onClick: () => openBulkRoleModal(selectedUsers) },
            { label: 'Exporter', onClick: () => exportSelectedUsers(selectedUsers) }
          ]}
        />
      )}
    </AdminLayout>
  )
}
```

#### 2. Products Management 🔴 Critical
**Estimated Effort**: 10-15 hours

**MVP Functions**:
```typescript
export interface AdminProductManagement {
  // CREATE
  createProduct(data: CreateProductData): Promise<ActionResult<Product>>
  duplicateProduct(id: string, overrides?: Partial<CreateProductData>): Promise<ActionResult<Product>>
  
  // READ
  getProducts(filters: ProductFilters): Promise<ActionResult<PaginatedProducts>>
  getProductById(id: string): Promise<ActionResult<ProductWithTranslations>>
  getLowStockProducts(threshold: number): Promise<ActionResult<Product[]>>
  getProductStats(): Promise<ActionResult<ProductStats>>
  
  // UPDATE  
  updateProduct(id: string, data: UpdateProductData): Promise<ActionResult<Product>>
  updateProductStock(id: string, stock: number, reason: string): Promise<ActionResult<void>>
  updateProductPrice(id: string, price: number, reason: string): Promise<ActionResult<void>>
  toggleProductStatus(id: string): Promise<ActionResult<void>>
  
  // DELETE
  deleteProduct(id: string, reason: string): Promise<ActionResult<void>>
  archiveProduct(id: string, reason: string): Promise<ActionResult<void>>
  
  // BULK OPERATIONS
  bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<ActionResult<void>>
  bulkUpdatePrices(updates: { id: string, price: number }[]): Promise<ActionResult<void>>
  bulkUpdateStock(updates: { id: string, stock: number }[]): Promise<ActionResult<void>>
  exportProducts(filters: ProductFilters): Promise<ActionResult<string>>
}
```

**Product Form Interface**:
```tsx
export function ProductForm({ product, mode = 'create' }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(getInitialData(product))
  const [activeTab, setActiveTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormHeader 
        title={mode === 'create' ? 'Nouveau Produit' : 'Modifier Produit'}
        breadcrumb={['Admin', 'Produits', product?.name || 'Nouveau']}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="inventory">Stock</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField name="name" label="Nom du produit *" required />
                <FormField name="slug" label="Slug URL *" required />
                <FormField name="price" label="Prix (€) *" type="number" required />
                <FormField name="category" label="Catégorie" type="select" options={categories} />
              </div>
              
              <FormField 
                name="description_short" 
                label="Description courte" 
                type="textarea" 
                maxLength={160}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <MultiLanguageContent
            languages={['fr', 'en', 'de', 'es']}
            fields={['name', 'description_short', 'description_long']}
            values={formData.translations}
            onChange={(translations) => setFormData({...formData, translations})}
          />
        </TabsContent>
        
        <TabsContent value="inventory">
          <StockManagement
            stock={formData.stock}
            lowStockThreshold={formData.low_stock_threshold}
            trackInventory={formData.track_inventory}
            onChange={(inventory) => setFormData({...formData, ...inventory})}
          />
        </TabsContent>
      </Tabs>
      
      <FormActions>
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'create' ? 'Créer' : 'Mettre à jour'}
        </Button>
      </FormActions>
    </form>
  )
}
```

#### 3. Orders Management 🟡 Important
**Estimated Effort**: 6-8 hours

**MVP Functions**:
```typescript
export interface AdminOrderManagement {
  // READ
  getOrders(filters: OrderFilters): Promise<ActionResult<PaginatedOrders>>
  getOrderById(id: string): Promise<ActionResult<OrderWithDetails>>
  getOrderStats(dateRange: DateRange): Promise<ActionResult<OrderStats>>
  
  // UPDATE
  updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<ActionResult<void>>
  addOrderNote(id: string, note: string): Promise<ActionResult<void>>
  updateShippingInfo(id: string, tracking: ShippingInfo): Promise<ActionResult<void>>
  
  // PROCESSING
  processRefund(id: string, amount: number, reason: string): Promise<ActionResult<void>>
  resendOrderEmail(id: string, type: EmailType): Promise<ActionResult<void>>
  exportOrders(filters: OrderFilters): Promise<ActionResult<string>>
  
  // BULK OPERATIONS  
  bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<ActionResult<void>>
  bulkExportInvoices(ids: string[]): Promise<ActionResult<string>>
}
```

### Phase 2: Advanced Admin Features (V2)

#### 1. Analytics & Reporting 📊
**Estimated Effort**: 20-30 hours

**Features**:
- **Business Dashboard**: Revenue, orders, conversion metrics
- **Product Analytics**: Best sellers, inventory trends, pricing insights
- **User Analytics**: Acquisition, retention, lifetime value
- **Custom Reports**: Configurable reports with export capabilities

```typescript
// Analytics interface
export interface AdminAnalytics {
  // Business Intelligence
  getBusinessDashboard(dateRange: DateRange): Promise<ActionResult<BusinessDashboard>>
  getRevenueAnalytics(period: TimePeriod): Promise<ActionResult<RevenueAnalytics>>
  getProductPerformance(limit: number): Promise<ActionResult<ProductPerformance[]>>
  getCustomerInsights(segment: CustomerSegment): Promise<ActionResult<CustomerInsights>>
  
  // Custom Reporting
  createCustomReport(config: ReportConfig): Promise<ActionResult<Report>>
  scheduleReport(reportId: string, schedule: ReportSchedule): Promise<ActionResult<void>>
  exportReport(reportId: string, format: ExportFormat): Promise<ActionResult<string>>
}
```

#### 2. Content Management System 📝
**Estimated Effort**: 15-20 hours

**Features**:
- **Article Editor**: Rich text editor with media management
- **SEO Optimization**: Meta tags, schema markup, sitemap generation  
- **Publishing Workflow**: Draft → Review → Published with scheduling
- **Multi-language Content**: Translation management interface

#### 3. Marketing Tools 📧
**Estimated Effort**: 12-18 hours

**Features**:
- **Newsletter Management**: Subscriber management, campaign creation
- **Promotion Engine**: Discount codes, sales campaigns
- **Customer Segmentation**: Behavioral and demographic segments
- **Automated Campaigns**: Welcome series, abandoned cart recovery

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Establish core architecture and essential e-commerce functionality

#### Sprint 1 (Week 1): Project Setup
- [x] **Migration Planning**: Analyze existing system, define migration strategy
- [ ] **Project Bootstrap**: Initialize Play Next.js boilerplate with Supabase
- [ ] **Database Design**: Create simplified schema, migration scripts
- [ ] **Authentication**: Implement Supabase Auth with role management
- [ ] **Base Components**: Setup UI library, common components, layouts

**Deliverables**:
- ✅ Development environment configured
- ✅ Database schema migrated and optimized  
- ✅ Authentication flow working
- ✅ Admin layout and basic navigation
- ✅ Component library foundations

#### Sprint 2 (Week 2): Product Catalog
- [ ] **Product Model**: Database tables, types, validation
- [ ] **Product CRUD**: Admin interface for product management
- [ ] **Product Display**: Public product listing and detail pages
- [ ] **Search & Filter**: Basic search functionality with category filters
- [ ] **Image Management**: Supabase Storage integration for product images

**Deliverables**:
- ✅ Complete product management system
- ✅ Product catalog with search/filter
- ✅ Image upload and optimization
- ✅ SEO-optimized product pages

#### Sprint 3 (Week 3): Shopping Cart & Orders
- [ ] **Cart System**: Add to cart, quantity management, persistence
- [ ] **Checkout Flow**: Guest and authenticated checkout process  
- [ ] **Payment Integration**: Stripe integration with multiple payment methods
- [ ] **Order Management**: Order processing, status updates, email notifications
- [ ] **Inventory**: Real-time stock tracking and updates

**Deliverables**:
- ✅ Complete shopping cart functionality
- ✅ Secure checkout process
- ✅ Payment processing with Stripe
- ✅ Order management system
- ✅ Automated email notifications

#### Sprint 4 (Week 4): User Management & Admin MVP
- [ ] **User Registration**: Account creation, email verification
- [ ] **User Profile**: Profile management, address book, order history
- [ ] **Admin Users**: Complete user management CRUD for admins
- [ ] **Admin Dashboard**: Basic analytics, recent orders, system status
- [ ] **Security & Permissions**: Role-based access control, audit logging

**Deliverables**:
- ✅ User registration and profile management
- ✅ Admin user management interface  
- ✅ Basic admin dashboard
- ✅ Security and permissions system
- ✅ Audit logging

### Phase 2: Enhancement (Weeks 5-8)
**Goal**: Add advanced features and optimize user experience

#### Sprint 5 (Week 5): Content Management
- [ ] **Blog System**: Article creation, editing, publishing workflow
- [ ] **Category Management**: Hierarchical categories with admin interface
- [ ] **Media Library**: Centralized media management with optimization
- [ ] **SEO Tools**: Meta management, sitemap generation, schema markup
- [ ] **Multi-language**: Content translation management

#### Sprint 6 (Week 6): Marketing & Business Features  
- [ ] **Newsletter System**: Subscriber management, campaign creation
- [ ] **Markets/Events**: Event management system for physical markets
- [ ] **Partners**: Partner directory and management
- [ ] **Promotions**: Discount system, coupon codes
- [ ] **Reviews & Ratings**: Product review system

#### Sprint 7 (Week 7): Advanced Admin Features
- [ ] **Analytics Dashboard**: Business intelligence, reporting tools
- [ ] **Inventory Management**: Stock alerts, reorder points, suppliers
- [ ] **Order Processing**: Advanced order management, shipping integration
- [ ] **Customer Support**: Support ticket system, customer communication tools
- [ ] **Bulk Operations**: Mass updates, import/export tools

#### Sprint 8 (Week 8): Optimization & Polish
- [ ] **Performance Optimization**: Caching, query optimization, CDN setup
- [ ] **Mobile Experience**: Responsive design refinements, PWA features
- [ ] **Testing**: Comprehensive test suite, E2E testing, load testing
- [ ] **Documentation**: User guides, API documentation, deployment guides
- [ ] **Launch Preparation**: Production setup, monitoring, backup systems

### Phase 3: Growth (Weeks 9-12)
**Goal**: Advanced features for business growth and scalability

#### Advanced Features
- [ ] **B2B Portal**: Wholesale pricing, bulk orders, business accounts
- [ ] **Multi-vendor**: Marketplace functionality, vendor management
- [ ] **Advanced Analytics**: Predictive analytics, customer insights, A/B testing
- [ ] **Marketing Automation**: Email sequences, behavior-triggered campaigns
- [ ] **International Expansion**: Multi-currency, regional pricing, local payments

---

## 📊 Technical Specifications

### Performance Requirements
- **Page Load Time**: < 2 seconds (LCP)
- **Time to Interactive**: < 3 seconds
- **Core Web Vitals**: All metrics in "Good" range
- **Mobile Performance**: 90+ Lighthouse score
- **Availability**: 99.9% uptime

### Security Requirements
- **Authentication**: Multi-factor authentication support
- **Data Protection**: GDPR compliance, data encryption at rest and in transit
- **Payment Security**: PCI DSS compliance through Stripe
- **Access Control**: Role-based permissions with audit trails
- **Rate Limiting**: API rate limiting and DDoS protection

### Scalability Requirements
- **Concurrent Users**: Support 1,000+ simultaneous users
- **Database Performance**: < 100ms average query response
- **Storage**: Unlimited product images, automatic optimization
- **CDN**: Global content delivery for improved performance
- **Monitoring**: Real-time performance monitoring and alerting

---

## 📈 Success Metrics & KPIs

### Business Metrics
- **Conversion Rate**: Target 15% (current: 10%)
- **Average Order Value**: Increase by 20%
- **Customer Acquisition Cost**: Reduce by 30%
- **Customer Lifetime Value**: Increase by 25%
- **Return Customer Rate**: Target 40%

### Technical Metrics
- **Performance**: Page load times < 2s consistently
- **Reliability**: 99.9% uptime, zero critical bugs
- **Development Velocity**: Feature delivery time reduced by 50%
- **Maintenance**: Bug resolution time < 24h
- **Testing**: 80%+ code coverage, automated E2E tests

### User Experience Metrics
- **User Satisfaction**: Net Promoter Score > 50
- **Task Completion Rate**: 95%+ for core user flows
- **Support Tickets**: 50% reduction in technical issues
- **Mobile Experience**: 90%+ mobile satisfaction score

---

## 🔒 Risk Assessment & Mitigation

### High Risk Items

#### 1. Data Migration Complexity 🔴
**Risk**: Loss of data or functionality during migration from 23-table complex system
**Mitigation**: 
- Comprehensive data mapping and validation
- Parallel system operation during transition
- Multiple backup strategies and rollback plans
- Phased migration with user acceptance testing

#### 2. SEO Impact 🔴  
**Risk**: Loss of search rankings during URL/structure changes
**Mitigation**:
- Maintain existing URL structure where possible
- Implement comprehensive 301 redirects
- Gradual rollout with search engine monitoring
- SEO audit and optimization post-launch

#### 3. User Experience Disruption 🟡
**Risk**: User confusion or frustration with new interface
**Mitigation**:
- User testing throughout development
- Gradual UI changes with A/B testing
- Comprehensive user onboarding
- Support documentation and tutorials

### Medium Risk Items

#### 4. Integration Complexity 🟡
**Risk**: Third-party integrations (Stripe, email, etc.) may require significant rework
**Mitigation**:
- Early integration testing and validation
- Fallback integration strategies
- Vendor communication and support plans

#### 5. Performance Issues 🟡
**Risk**: New architecture may not meet performance requirements
**Mitigation**:
- Performance testing throughout development  
- Load testing with realistic traffic patterns
- Performance monitoring and optimization tools
- CDN and caching strategies

---

## 📋 Conclusion

HerbisVeritas V2 represents a strategic technical renovation that will position the platform for sustained growth and improved user experience. By migrating to a modern, simplified architecture based on Play Next.js and Supabase, we'll achieve:

1. **Simplified Maintenance**: 50% reduction in development complexity
2. **Improved Performance**: Sub-2-second page loads and better Core Web Vitals
3. **Enhanced User Experience**: Modern, responsive interface with better conversion rates
4. **Scalable Architecture**: Support for 10x user growth with improved reliability
5. **Comprehensive Admin Tools**: Full-featured admin panel with analytics and bulk operations

The phased approach ensures minimal business disruption while delivering value incrementally. With proper execution of this PRD, HerbisVeritas will have a world-class e-commerce platform capable of competing with industry leaders while maintaining its unique positioning in the natural products market.

---

**Next Steps**: 
1. ✅ Stakeholder review and approval of PRD
2. ⏳ Final technical architecture review  
3. ⏳ Resource allocation and team assignment
4. ⏳ Sprint planning for Phase 1 kickoff
5. ⏳ Risk assessment and contingency planning finalization