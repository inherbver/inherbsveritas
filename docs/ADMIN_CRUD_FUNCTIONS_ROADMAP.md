# Fonctions CRUD Admin - Roadmap MVP

## 📋 Architecture MVP - 13 Tables Validées

### Tables Core E-commerce (8 tables)
```
✅ Utilisateurs & Adresses:
- users                    → 3 rôles (user/admin/dev)
- addresses                → Table séparée FK

✅ Produits & Catalogue:
- products                 → Labels HerbisVeritas + INCI + i18n JSONB  
- categories               → Hiérarchique + i18n JSONB

✅ Commerce:
- carts                    → Guest/User système
- cart_items               → Éléments panier
- orders                   → Stripe complet, 4 états
- order_items              → Snapshot produits
```

### Tables Content & Marketing (5 tables)
```
✅ Contenu:
- articles                 → TipTap éditeur riche (categories seulement)
- partners                 → Points vente + réseaux sociaux
- next_events              → Hero simple (pas calendrier)
- newsletter_subscribers   → Basique (pas tracking)
- featured_items           → Hero polyvalent

❌ Features Reportées V2:
- tags/article_tags (M:N → categories seulement)
- markets calendrier récurrence
- audit_logs/events (monitoring)
- login_attempts (sécurité avancée)
```

### CRUD Actuels Disponibles

| Entity | Create | Read | Update | Delete | Bulk | Status | Search |
|--------|--------|------|--------|--------|------|--------|--------|
| **Users** | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Products** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Markets** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Articles** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Partners** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Orders** | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## 🎯 Phase MVP : Fonctions CRUD Essentielles

### 1. 👥 **Users Management** (Priorité: 🔴 CRITIQUE)

#### Fonctions Manquantes MVP
```typescript
// CREATE
async function createUser(data: CreateUserData): Promise<ActionResult<User>>
async function inviteUserByEmail(email: string, role: UserRole): Promise<ActionResult<void>>

// READ (améliorer existant)
async function getUsersWithFilters(filters: UserFilters): Promise<ActionResult<PaginatedUsers>>
async function getUserById(id: string): Promise<ActionResult<UserDetail>>
async function getUserStats(): Promise<ActionResult<UserStats>>

// UPDATE (améliorer existant)  
async function updateUserProfile(id: string, data: UpdateUserData): Promise<ActionResult<User>>
async function updateUserRole(id: string, role: UserRole): Promise<ActionResult<void>>
async function resetUserPassword(id: string): Promise<ActionResult<void>>

// DELETE
async function softDeleteUser(id: string, reason: string): Promise<ActionResult<void>>
async function suspendUser(id: string, reason: string): Promise<ActionResult<void>>
async function reactivateUser(id: string): Promise<ActionResult<void>>

// BULK
async function bulkUpdateUserRoles(userIds: string[], role: UserRole): Promise<ActionResult<void>>
async function exportUsers(filters: UserFilters): Promise<ActionResult<string>> // CSV export
```

**Utilité MVP:**
- ✅ Gestion complète des comptes clients
- ✅ Modération utilisateurs
- ✅ Support client efficace

### 2. 📦 **Products Management** (Priorité: 🔴 CRITIQUE)

#### Fonctions Manquantes MVP
```typescript
// CREATE
async function createProduct(data: CreateProductData): Promise<ActionResult<Product>>
async function duplicateProduct(id: string): Promise<ActionResult<Product>>

// READ (améliorer existant)
async function getProductsForAdmin(filters: ProductFilters): Promise<ActionResult<PaginatedProducts>>
async function getProductById(id: string): Promise<ActionResult<ProductDetail>>
async function getProductStats(): Promise<ActionResult<ProductStats>>
async function getLowStockProducts(): Promise<ActionResult<Product[]>>

// UPDATE
async function updateProduct(id: string, data: UpdateProductData): Promise<ActionResult<Product>>
async function updateProductStock(id: string, stock: number): Promise<ActionResult<void>>
async function updateProductPrice(id: string, price: number): Promise<ActionResult<void>>

// DELETE
async function deleteProduct(id: string): Promise<ActionResult<void>>
async function archiveProduct(id: string): Promise<ActionResult<void>>

// BULK
async function bulkUpdateProductStatus(ids: string[], status: ProductStatus): Promise<ActionResult<void>>
async function bulkUpdateProductPrices(updates: PriceUpdate[]): Promise<ActionResult<void>>
async function exportProducts(filters: ProductFilters): Promise<ActionResult<string>>
```

**Utilité MVP:**
- ✅ Gestion catalogue complet
- ✅ Suivi stock temps réel
- ✅ Mises à jour prix bulk

### 3. 📅 **Markets/Events Management** (Priorité: 🟡 IMPORTANT)

#### Fonctions à Améliorer MVP
```typescript
// READ (améliorer existant)
async function getMarketsWithOccurrences(filters: MarketFilters): Promise<ActionResult<MarketWithOccurrences[]>>
async function getMarketStats(): Promise<ActionResult<MarketStats>>
async function getUpcomingMarkets(): Promise<ActionResult<MarketOccurrence[]>>

// UPDATE (améliorer existant)
async function toggleMarketStatus(id: string): Promise<ActionResult<void>>

// BULK (nouveau)
async function bulkUpdateMarketStatus(ids: string[], active: boolean): Promise<ActionResult<void>>
async function exportMarkets(filters: MarketFilters): Promise<ActionResult<string>>

// OCCURRENCES (nouveau - crucial pour gestion)
async function getMarketOccurrences(marketId: string, dateRange: DateRange): Promise<ActionResult<MarketOccurrence[]>>
async function cancelMarketOccurrence(marketId: string, date: string, reason: string): Promise<ActionResult<void>>
```

**Utilité MVP:**
- ✅ Vision claire des événements
- ✅ Gestion annulations ponctuelles
- ✅ Planification optimisée

### 4. 📰 **Articles Management** (Priorité: 🟡 IMPORTANT)

#### Existant Déjà Complet ✅
- Create/Update/Delete ✅
- Bulk status updates ✅
- Categories & Tags ✅

#### Améliorations MVP
```typescript
// READ (améliorer)
async function getArticleStats(): Promise<ActionResult<ArticleStats>>
async function getPopularArticles(limit: number): Promise<ActionResult<Article[]>>

// SEO & Analytics
async function updateArticleSEO(id: string, seo: SEOData): Promise<ActionResult<void>>
async function getArticleAnalytics(id: string): Promise<ActionResult<ArticleAnalytics>>
```

---

## 🚀 Phase V2 : Fonctions Avancées

### 1. 👥 **Users Management V2**

```typescript
// ANALYTICS & INSIGHTS
async function getUserAnalytics(userId: string): Promise<ActionResult<UserAnalytics>>
async function getUserPurchaseHistory(userId: string): Promise<ActionResult<PurchaseHistory>>
async function getUserEngagementMetrics(): Promise<ActionResult<EngagementMetrics>>

// SEGMENTATION
async function createUserSegment(criteria: SegmentCriteria): Promise<ActionResult<UserSegment>>
async function getUsersBySegment(segmentId: string): Promise<ActionResult<User[]>>

// AUTOMATION  
async function scheduleUserEmail(userIds: string[], templateId: string, sendAt: Date): Promise<ActionResult<void>>
async function autoTagUsers(criteria: TagCriteria): Promise<ActionResult<number>>

// ADVANCED MODERATION
async function getUserActivityLog(userId: string): Promise<ActionResult<ActivityLog[]>>
async function flagSuspiciousUsers(): Promise<ActionResult<User[]>>
async function getUserRiskScore(userId: string): Promise<ActionResult<RiskScore>>
```

### 2. 📦 **Products Management V2**

```typescript
// ANALYTICS & INSIGHTS  
async function getProductAnalytics(productId: string): Promise<ActionResult<ProductAnalytics>>
async function getProductPerformanceMetrics(): Promise<ActionResult<PerformanceMetrics>>
async function predictProductDemand(productId: string): Promise<ActionResult<DemandForecast>>

// INVENTORY MANAGEMENT
async function createStockAlert(productId: string, threshold: number): Promise<ActionResult<void>>
async function getInventoryReport(dateRange: DateRange): Promise<ActionResult<InventoryReport>>
async function suggestReorderQuantities(): Promise<ActionResult<ReorderSuggestion[]>>

// PRICING OPTIMIZATION
async function analyzePriceCompetitiveness(productIds: string[]): Promise<ActionResult<PriceAnalysis>>
async function suggestPriceAdjustments(): Promise<ActionResult<PriceSuggestion[]>>
async function schedulePriceChanges(changes: ScheduledPriceChange[]): Promise<ActionResult<void>>

// ADVANCED BULK OPERATIONS
async function bulkImportProducts(csvData: string): Promise<ActionResult<ImportResult>>
async function syncProductsWithSupplier(supplierId: string): Promise<ActionResult<SyncResult>>
```

### 3. 📅 **Markets/Events Management V2**

```typescript
// EVENT TYPES DISTINCTION
async function createRecurringMarket(data: RecurringMarketData): Promise<ActionResult<Market>>
async function createOneTimeEvent(data: OneTimeEventData): Promise<ActionResult<Event>>
async function convertMarketToEvent(marketId: string): Promise<ActionResult<Event>>

// ANALYTICS & OPTIMIZATION
async function getMarketPerformanceMetrics(): Promise<ActionResult<MarketMetrics>>
async function analyzeMarketAttendance(marketId: string): Promise<ActionResult<AttendanceAnalytics>>
async function suggestOptimalMarketTimes(cityId: string): Promise<ActionResult<TimeSuggestion[]>>

// ADVANCED MANAGEMENT
async function createMarketTemplate(data: MarketTemplate): Promise<ActionResult<Template>>
async function cloneMarketFromTemplate(templateId: string, overrides: MarketOverrides): Promise<ActionResult<Market>>
async function scheduleMarketNotifications(marketId: string, notifications: NotificationSchedule[]): Promise<ActionResult<void>>

// WEATHER & EXTERNAL INTEGRATION
async function getWeatherImpactForecast(marketId: string, date: string): Promise<ActionResult<WeatherImpact>>
async function autoSuggestMarketCancellations(): Promise<ActionResult<CancellationSuggestion[]>>
```

### 4. 📰 **Articles Management V2**

```typescript
// CONTENT OPTIMIZATION
async function analyzeContentPerformance(): Promise<ActionResult<ContentAnalytics>>
async function suggestContentTopics(): Promise<ActionResult<TopicSuggestion[]>>
async function optimizeArticleForSEO(articleId: string): Promise<ActionResult<SEOOptimization>>

// ADVANCED PUBLISHING
async function scheduleArticlePublishing(articleId: string, publishAt: Date): Promise<ActionResult<void>>
async function createContentCalendar(dateRange: DateRange): Promise<ActionResult<ContentCalendar>>
async function autoGenerateArticleExcerpts(): Promise<ActionResult<number>>

// ANALYTICS & INSIGHTS
async function getContentEngagementMetrics(): Promise<ActionResult<EngagementMetrics>>
async function analyzeReaderJourney(): Promise<ActionResult<JourneyAnalytics>>
async function identifyTrendingTopics(): Promise<ActionResult<TrendingTopic[]>>
```

### 5. 📊 **Dashboard & Reporting V2**

```typescript
// BUSINESS INTELLIGENCE
async function generateExecutiveDashboard(): Promise<ActionResult<ExecutiveDashboard>>
async function createCustomReport(config: ReportConfig): Promise<ActionResult<Report>>
async function scheduleAutomaticReports(reportId: string, schedule: ReportSchedule): Promise<ActionResult<void>>

// REAL-TIME MONITORING
async function getRealtimeBusinessMetrics(): Promise<ActionResult<RealtimeMetrics>>
async function createBusinessAlert(condition: AlertCondition): Promise<ActionResult<Alert>>
async function getSystemHealthStatus(): Promise<ActionResult<HealthStatus>>

// DATA EXPORT & INTEGRATION
async function exportDataToBI(query: DataQuery): Promise<ActionResult<ExportResult>>
async function syncWithExternalAnalytics(platform: AnalyticsPlatform): Promise<ActionResult<SyncResult>>
```

---

## ⏱️ Estimation du Développement

### MVP (Fonctions Essentielles)
| Module | Fonctions | Temps Estimé | Priorité |
|--------|-----------|--------------|----------|
| **Users CRUD** | 12 fonctions | 8-12h | 🔴 Critique |
| **Products CRUD** | 10 fonctions | 10-15h | 🔴 Critique |
| **Markets Améliorations** | 6 fonctions | 4-6h | 🟡 Important |
| **Articles Améliorations** | 4 fonctions | 2-3h | 🟡 Important |
| **Tests & Debug** | - | 6-8h | 🔴 Critique |
| **TOTAL MVP** | **32 fonctions** | **30-44h** | |

### V2 (Fonctions Avancées)
| Module | Fonctions | Temps Estimé | 
|--------|-----------|--------------|
| **Analytics & BI** | 15 fonctions | 20-30h |
| **Automation** | 10 fonctions | 15-20h |
| **Advanced Features** | 20 fonctions | 25-35h |
| **Integrations** | 8 fonctions | 12-18h |
| **TOTAL V2** | **53 fonctions** | **72-103h** |

---

## 🎯 Plan de Déploiement Recommandé

### Sprint 1 (MVP Critique)
**Semaine 1-2 : Users & Products CRUD**
- Finaliser Users CRUD complet
- Finaliser Products CRUD complet
- Tests unitaires et intégration

### Sprint 2 (MVP Complémentaire)
**Semaine 3 : Markets & Articles**
- Améliorations Markets avec occurrences
- Finitions Articles avec analytics
- Interface admin mise à jour

### Sprint 3 (Stabilisation MVP)
**Semaine 4 : Tests & Optimisation**
- Tests E2E complets
- Optimisation performances
- Documentation utilisateur

### Sprint 4+ (V2 Progressif)
**Mois 2+ : Fonctionnalités Avancées**
- Analytics et BI par modules
- Automation progressive
- Intégrations externes

---

## 🏗️ Architecture Technique Recommandée

### Structure des Actions
```typescript
// Pattern uniforme pour toutes les entités
interface CRUDActions<T, CreateData, UpdateData, Filters> {
  // Core CRUD
  create(data: CreateData): Promise<ActionResult<T>>
  read(filters?: Filters): Promise<ActionResult<PaginatedResult<T>>>
  update(id: string, data: UpdateData): Promise<ActionResult<T>>
  delete(id: string): Promise<ActionResult<void>>
  
  // Bulk Operations  
  bulkUpdate(ids: string[], data: Partial<UpdateData>): Promise<ActionResult<void>>
  bulkDelete(ids: string[]): Promise<ActionResult<void>>
  
  // Utility
  export(filters: Filters): Promise<ActionResult<string>>
  getStats(): Promise<ActionResult<EntityStats>>
}
```

### Sécurité & Permissions
```typescript
// Décorateur uniforme de sécurité
const withAdminSecurity = (permission: string) => 
  withRateLimit("ADMIN", permission)(
    withPermissionSafe(permission, /* action */)
  )

// Usage
export const deleteProduct = withAdminSecurity("products:delete")(
  async (id: string) => { /* implementation */ }
)
```

Cette roadmap vous donne une vision complète et priorisée des fonctions CRUD nécessaires pour un admin panel complet et évolutif.