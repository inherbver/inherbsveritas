# Guide de Gestion de Contenu - HerbisVeritas V2

## 📋 Vue d'Ensemble

Ce guide détaille les systèmes de gestion de contenu intégrés dans HerbisVeritas V2, incluant l'administration des articles, la gestion des médias, les bonnes pratiques éditoriales et l'optimisation SEO.

## 🎯 Architecture de Contenu

### Structure des Entités

```typescript
// Types de contenu MVP (13 tables validées)
interface ContentEntities {
  articles: Article[]       // Magazine/Blog TipTap
  products: Product[]       // Catalogue + labels HerbisVeritas
  partners: Partner[]       // Points vente + réseaux sociaux
  next_events: NextEvent[]  // Hero événements simples
  categories: Category[]    // Organisation hiérarchique (pas tags)
  featured_items: FeaturedItem[] // Hero polyvalent
  newsletter_subscribers: NewsletterSubscriber[] // Basique
}

// Structure Article MVP
interface Article {
  id: string
  title: Record<'fr' | 'en', string>  // i18n MVP FR/EN
  slug: Record<'fr' | 'en', string>
  excerpt?: Record<'fr' | 'en', string>
  content: Record<'fr' | 'en', string> // TipTap JSON
  featured_image?: string
  category_id: string  // Categories seulement (pas tags)
  
  // Métadonnées
  publishedAt?: Date
  author: User
  status: 'draft' | 'published' | 'archived'
  
  // Organisation
  categories: Category[]
  tags: Tag[]
  
  // SEO & Analytics
  seo: SEOMetadata
  readingTime: number
  viewCount: number
}
```

### Taxonomie et Classification

```typescript
// Système de catégories hiérarchique
interface Category {
  id: string
  name: Record<Locale, string>
  slug: Record<Locale, string>
  description?: Record<Locale, string>
  parentId?: string
  children: Category[]
  
  // Configuration
  color: string
  icon?: string
  isActive: boolean
}

// Tags pour classification croisée
interface Tag {
  id: string
  name: Record<Locale, string>
  slug: Record<Locale, string>
  color?: string
  usage_count: number
}
```

## 🖥️ Interface d'Administration

### Dashboard Editorial

```typescript
// Métriques éditoriales en temps réel
interface EditorialDashboard {
  // Statistiques de contenu
  contentStats: {
    totalArticles: number
    drafts: number
    published: number
    scheduled: number
    mostViewed: Article[]
    recentActivity: Activity[]
  }
  
  // Performance SEO
  seoMetrics: {
    avgReadingTime: number
    topKeywords: string[]
    searchTraffic: number
    socialShares: number
  }
  
  // Workflow
  pendingReviews: Article[]
  scheduledPosts: Article[]
  popularCategories: Category[]
}
```

### Actions CRUD Avancées

Basées sur les patterns Strapi/Contentful, notre système implémente :

```typescript
// Actions de contenu inspirées des CMS headless
class ContentManagementActions {
  // Création et publication
  async createArticle(data: CreateArticleData): Promise<ActionResult<Article>> {
    // Validation des données
    const validatedData = await validateArticleSchema(data)
    
    // Génération automatique
    const slug = await generateUniqueSlug(validatedData.title)
    const readingTime = calculateReadingTime(validatedData.content)
    
    // Création avec workflow
    return await this.articleService.create({
      ...validatedData,
      slug,
      readingTime,
      status: 'draft',
      authorId: getCurrentUser().id
    })
  }

  // Publication avec gestion d'état
  async publishArticle(id: string): Promise<ActionResult<void>> {
    const article = await this.getArticle(id)
    
    // Validations pré-publication
    await this.validateForPublication(article)
    await this.generateSEOMetadata(article)
    
    // Publication atomique
    return await this.updateArticleStatus(id, 'published', {
      publishedAt: new Date(),
      searchIndexed: true
    })
  }

  // Gestion des versions et brouillons
  async saveAsDraft(id: string, changes: Partial<Article>): Promise<ActionResult<Article>> {
    // Sauvegarde automatique avec versioning
    return await this.articleService.update(id, {
      ...changes,
      lastModified: new Date(),
      version: await this.incrementVersion(id)
    })
  }

  // Operations bulk inspirées de Strapi Content Manager
  async bulkUpdateStatus(
    articleIds: string[], 
    status: ArticleStatus
  ): Promise<ActionResult<void>> {
    // Transaction atomique pour operations bulk
    return await this.db.transaction(async (trx) => {
      const updates = articleIds.map(id => 
        this.articleService.update(id, { status }, { transaction: trx })
      )
      await Promise.all(updates)
    })
  }
}
```

### Interface d'Édition Moderne

```typescript
// Éditeur rich-text avec preview temps réel
interface EditorConfiguration {
  // Configuration Tiptap/EditorJS
  editor: {
    toolbar: EditorTool[]
    shortcuts: KeyboardShortcut[]
    plugins: EditorPlugin[]
    autosave: {
      enabled: true
      interval: 30000 // 30 secondes
    }
  }
  
  // Preview en temps réel
  preview: {
    mode: 'side-by-side' | 'tab' | 'fullscreen'
    responsive: boolean
    darkMode: boolean
  }
  
  // Assistance IA (optionnel)
  aiAssistant: {
    grammarCheck: boolean
    seoSuggestions: boolean
    titleGenerator: boolean
    tagSuggestions: boolean
  }
}

// Composant d'édition
const ArticleEditor: React.FC<EditorProps> = ({ article, onSave }) => {
  const [content, setContent] = useState(article.content)
  const [isDirty, setIsDirty] = useState(false)
  
  // Sauvegarde automatique
  const debouncedSave = useDebouncedCallback(
    async (changes: Partial<Article>) => {
      await saveAsDraft(article.id, changes)
      setIsDirty(false)
    },
    2000
  )
  
  // Gestion des changements
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
    debouncedSave({ content: newContent })
  }, [debouncedSave])
  
  return (
    <div className="editor-container">
      <EditorToolbar />
      <div className="editor-workspace">
        <RichTextEditor 
          content={content}
          onChange={handleContentChange}
          className="editor-main"
        />
        <ArticlePreview 
          content={content}
          metadata={article}
          className="editor-preview"
        />
      </div>
      <EditorStatus isDirty={isDirty} />
    </div>
  )
}
```

## 📁 Gestion des Médias

### Organisation et Stockage

```typescript
// Structure hiérarchique des médias
interface MediaLibrary {
  folders: {
    articles: MediaFolder      // Images d'articles
    products: MediaFolder      // Images produits
    markets: MediaFolder       // Photos d'événements
    gallery: MediaFolder       // Galerie générale
    temp: MediaFolder          // Fichiers temporaires
  }
  
  // Métadonnées enrichies
  metadata: {
    alt: Record<Locale, string>
    caption?: Record<Locale, string>
    credits?: string
    tags: string[]
    uploadedBy: User
    usageCount: number
  }
}

// Service de gestion des médias
class MediaManagementService {
  async uploadImage(file: File, folder: string): Promise<ActionResult<MediaFile>> {
    // Validation et optimisation
    const validatedFile = await this.validateImageFile(file)
    const optimizedFile = await this.optimizeImage(validatedFile)
    
    // Upload avec génération de variants
    const uploadResult = await this.uploadToStorage(optimizedFile, folder)
    
    // Génération automatique des formats
    const variants = await this.generateImageVariants(uploadResult, {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 600, height: 400 },
      large: { width: 1200, height: 800 },
      webp: { format: 'webp', quality: 85 }
    })
    
    return {
      ...uploadResult,
      variants,
      metadata: await this.extractImageMetadata(file)
    }
  }

  // Recherche et filtrage avancé
  async searchMedia(filters: MediaFilters): Promise<PaginatedResult<MediaFile>> {
    const query = this.buildMediaQuery(filters)
    
    return await this.mediaRepository.findMany({
      where: query,
      include: ['tags', 'usageStats'],
      orderBy: filters.sortBy || 'createdAt',
      ...filters.pagination
    })
  }
}
```

### Interface de Gestion

```typescript
// Composant galerie média
const MediaLibraryGrid: React.FC<MediaLibraryProps> = () => {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>('/')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Actions bulk
  const handleBulkAction = async (action: BulkMediaAction) => {
    switch (action.type) {
      case 'move':
        await moveFilesToFolder(selectedFiles, action.targetFolder)
        break
      case 'tag':
        await addTagsToFiles(selectedFiles, action.tags)
        break
      case 'delete':
        await deleteFiles(selectedFiles)
        break
    }
    
    // Refresh et reset sélection
    await refreshMedia()
    setSelectedFiles([])
  }
  
  return (
    <div className="media-library">
      <MediaLibraryToolbar 
        onBulkAction={handleBulkAction}
        selectedCount={selectedFiles.length}
      />
      
      <div className="media-browser">
        <FolderTree 
          currentFolder={currentFolder}
          onFolderChange={setCurrentFolder}
        />
        
        <MediaGrid 
          viewMode={viewMode}
          files={mediaFiles}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
        />
      </div>
      
      <MediaPreviewPanel 
        selectedFile={selectedFiles[0]}
        onEdit={handleEditMetadata}
      />
    </div>
  )
}
```

## 🔍 SEO et Optimisation

### Métadonnées Automatisées

```typescript
// Génération SEO intelligente
class SEOOptimizationService {
  async generateSEOMetadata(article: Article): Promise<SEOMetadata> {
    const content = article.content['fr'] // Langue par défaut
    
    return {
      // Méta-données basiques
      title: this.optimizeTitle(article.title['fr']),
      description: article.excerpt?.['fr'] || 
                  this.generateDescription(content),
      keywords: await this.extractKeywords(content),
      
      // Open Graph
      ogTitle: article.title['fr'],
      ogDescription: this.generateDescription(content, 160),
      ogImage: article.featuredImage,
      ogType: 'article',
      
      // Twitter Card
      twitterCard: 'summary_large_image',
      twitterTitle: article.title['fr'],
      twitterDescription: this.generateDescription(content, 200),
      twitterImage: article.featuredImage,
      
      // Données structurées
      structuredData: this.generateArticleSchema(article),
      
      // Métriques
      readabilityScore: this.calculateReadability(content),
      keywordDensity: this.analyzeKeywordDensity(content)
    }
  }
  
  // Analyse et recommandations
  async analyzeSEOPerformance(article: Article): Promise<SEOAnalysis> {
    const analysis = {
      score: 0,
      recommendations: [] as SEORecommendation[],
      warnings: [] as string[]
    }
    
    // Analyse du titre
    const titleLength = article.title['fr'].length
    if (titleLength < 30 || titleLength > 60) {
      analysis.recommendations.push({
        type: 'title_length',
        message: 'Optimiser la longueur du titre (30-60 caractères)',
        impact: 'high'
      })
    } else {
      analysis.score += 20
    }
    
    // Analyse du contenu
    const wordCount = this.countWords(article.content['fr'])
    if (wordCount < 300) {
      analysis.recommendations.push({
        type: 'content_length',
        message: 'Augmenter la longueur du contenu (min. 300 mots)',
        impact: 'medium'
      })
    } else {
      analysis.score += 15
    }
    
    // Analyse des images
    if (!article.featuredImage) {
      analysis.recommendations.push({
        type: 'featured_image',
        message: 'Ajouter une image à la une',
        impact: 'medium'
      })
    } else {
      analysis.score += 10
    }
    
    return analysis
  }
}
```

### Sitemap et Indexation

```typescript
// Génération automatique du sitemap
export async function generateSitemap(): Promise<string> {
  const articles = await getPublishedArticles()
  const products = await getActiveProducts()
  const markets = await getUpcomingMarkets()
  
  const sitemapEntries = [
    // Pages statiques
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/magazine', changefreq: 'daily', priority: 0.9 },
    { url: '/marches', changefreq: 'weekly', priority: 0.8 },
    { url: '/boutique', changefreq: 'daily', priority: 0.8 },
    
    // Articles dynamiques
    ...articles.map(article => ({
      url: `/magazine/${article.slug['fr']}`,
      lastmod: article.publishedAt?.toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    })),
    
    // Produits
    ...products.map(product => ({
      url: `/produit/${product.slug}`,
      lastmod: product.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.6
    }))
  ]
  
  return generateXMLSitemap(sitemapEntries)
}

// Hooks de réindexation automatique
export const useSearchIndexing = () => {
  const reindexArticle = useCallback(async (articleId: string) => {
    const article = await getArticle(articleId)
    
    if (article.status === 'published') {
      // Indexation pour recherche interne
      await searchService.indexDocument({
        id: article.id,
        type: 'article',
        title: article.title,
        content: article.content,
        tags: article.tags.map(tag => tag.name),
        category: article.categories[0]?.name
      })
      
      // Notification des moteurs de recherche
      await notifySearchEngines([
        `https://herbisveritas.com/magazine/${article.slug['fr']}`
      ])
    }
  }, [])
  
  return { reindexArticle }
}
```

## 🔄 Workflow Editorial

### États et Transitions

```typescript
// Machine d'état pour workflow éditorial
type ArticleStatus = 
  | 'draft'
  | 'review'
  | 'approved' 
  | 'scheduled'
  | 'published'
  | 'archived'

interface WorkflowTransition {
  from: ArticleStatus
  to: ArticleStatus
  requiredRole: UserRole
  conditions?: (article: Article) => boolean
  actions?: (article: Article) => Promise<void>
}

const workflowTransitions: WorkflowTransition[] = [
  {
    from: 'draft',
    to: 'review',
    requiredRole: 'editor',
    conditions: (article) => article.content['fr'].length > 100,
    actions: async (article) => {
      await notifyReviewers(article)
      await generateSEOPreview(article)
    }
  },
  {
    from: 'review',
    to: 'approved',
    requiredRole: 'admin',
    actions: async (article) => {
      await finalSEOCheck(article)
      await validateImages(article)
    }
  },
  {
    from: 'approved',
    to: 'scheduled',
    requiredRole: 'editor',
    conditions: (article) => !!article.scheduledAt
  },
  {
    from: 'scheduled',
    to: 'published',
    requiredRole: 'system',
    actions: async (article) => {
      await generateStaticPage(article)
      await updateSearchIndex(article)
      await notifySocialMedia(article)
    }
  }
]
```

### Planification et Automatisation

```typescript
// Service de planification des publications
class ContentSchedulingService {
  async schedulePublication(
    articleId: string, 
    publishDate: Date
  ): Promise<ActionResult<void>> {
    // Validation de la date
    if (publishDate <= new Date()) {
      throw new Error('La date de publication doit être future')
    }
    
    // Mise à jour de l'article
    await this.articleService.update(articleId, {
      status: 'scheduled',
      scheduledAt: publishDate
    })
    
    // Programmation de la tâche
    await this.scheduleTask({
      type: 'publish_article',
      articleId,
      executeAt: publishDate,
      retries: 3
    })
    
    return { success: true }
  }
  
  // Traitement des publications programmées
  async processScheduledPublications(): Promise<void> {
    const now = new Date()
    
    const scheduledArticles = await this.articleService.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { lte: now }
      }
    })
    
    for (const article of scheduledArticles) {
      try {
        await this.publishArticle(article.id)
        
        // Notifications post-publication
        await this.notificationService.send({
          type: 'article_published',
          article,
          channels: ['email', 'social']
        })
        
      } catch (error) {
        console.error(`Erreur publication article ${article.id}:`, error)
        
        // Retry logic
        await this.scheduleRetry(article.id, error)
      }
    }
  }
}
```

## 📊 Analytics et Performance

### Métriques de Contenu

```typescript
// Suivi des performances éditoriales
interface ContentAnalytics {
  // Métriques de lecture
  pageViews: number
  uniqueReaders: number
  avgTimeOnPage: number
  bounceRate: number
  readingCompletion: number
  
  // Engagement
  socialShares: number
  comments: number
  likes: number
  bookmarks: number
  
  // SEO Performance
  organicTraffic: number
  keywordRankings: KeywordRanking[]
  clickThroughRate: number
  
  // Données temporelles
  dailyViews: TimeSeriesData[]
  peakHours: number[]
  seasonality: SeasonalityData
}

// Dashboard analytics
const ContentAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('last_30_days')
  const { data: analytics } = useContentAnalytics(timeRange)
  
  return (
    <div className="analytics-dashboard">
      <div className="metrics-grid">
        <MetricCard 
          title="Vues totales"
          value={analytics.totalViews}
          change={analytics.viewsChange}
          trend="up"
        />
        
        <MetricCard 
          title="Temps de lecture moyen"
          value={`${analytics.avgReadingTime}min`}
          change={analytics.readingTimeChange}
        />
        
        <MetricCard 
          title="Taux de completion"
          value={`${analytics.completionRate}%`}
          change={analytics.completionChange}
        />
        
        <MetricCard 
          title="Partages sociaux"
          value={analytics.totalShares}
          change={analytics.sharesChange}
          trend="up"
        />
      </div>
      
      <div className="charts-section">
        <TrafficChart data={analytics.trafficData} />
        <PopularContentTable articles={analytics.topArticles} />
        <SEOPerformanceChart keywords={analytics.keywordRankings} />
      </div>
    </div>
  )
}
```

## 🎨 Personnalisation et Thèmes

### Système de Templates

```typescript
// Templates d'articles configurables
interface ArticleTemplate {
  id: string
  name: string
  description: string
  preview: string
  
  // Structure
  sections: TemplateSection[]
  defaultFields: Record<string, any>
  
  // Styling
  styling: {
    headerStyle: 'minimal' | 'featured' | 'overlay'
    layoutType: 'single-column' | 'sidebar' | 'magazine'
    colorScheme: 'nature' | 'earth' | 'fresh' | 'elegant'
  }
  
  // Configuration
  features: {
    showAuthor: boolean
    showDate: boolean
    showReadingTime: boolean
    showTags: boolean
    showRelated: boolean
    enableComments: boolean
    enableSharing: boolean
  }
}

// Générateur de templates
const templateGenerator = {
  magazine: {
    name: 'Template Magazine',
    sections: [
      { type: 'hero', config: { showImage: true, overlay: true } },
      { type: 'content', config: { columns: 1, sidebar: true } },
      { type: 'related', config: { count: 3, layout: 'grid' } }
    ]
  },
  
  product: {
    name: 'Template Produit',
    sections: [
      { type: 'gallery', config: { thumbnails: true, zoom: true } },
      { type: 'specs', config: { tabbed: true } },
      { type: 'reviews', config: { enabled: true } }
    ]
  },
  
  event: {
    name: 'Template Événement',
    sections: [
      { type: 'banner', config: { countdown: true } },
      { type: 'details', config: { map: true, weather: true } },
      { type: 'registration', config: { form: true } }
    ]
  }
}
```

## 🔒 Sécurité et Permissions

### Contrôle d'Accès Granulaire

```typescript
// Permissions basées sur les rôles et ressources
interface ContentPermissions {
  // Actions de base
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  publish: boolean
  
  // Actions avancées
  bulkEdit: boolean
  moderateComments: boolean
  manageTags: boolean
  accessAnalytics: boolean
  
  // Filtres contextuels
  ownContentOnly: boolean
  categoryRestrictions: string[]
  statusRestrictions: ArticleStatus[]
}

// Middleware de vérification des permissions
export const withContentPermissions = (
  action: keyof ContentPermissions
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const resourceId = req.params.id
    
    // Vérification des permissions générales
    if (!hasPermission(user, action)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes' 
      })
    }
    
    // Vérification des permissions spécifiques à la ressource
    if (resourceId && action !== 'create') {
      const resource = await getContentResource(resourceId)
      
      if (!canAccessResource(user, resource, action)) {
        return res.status(403).json({ 
          error: 'Accès non autorisé à cette ressource' 
        })
      }
    }
    
    // Log de sécurité
    await auditLog({
      userId: user.id,
      action,
      resourceType: 'content',
      resourceId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    next()
  }
}
```

## 🔧 Configuration et Maintenance

### Configuration du Système

```typescript
// Configuration centralisée du CMS
export const cmsConfig = {
  // Paramètres éditoriaux
  editorial: {
    defaultStatus: 'draft' as ArticleStatus,
    autoSave: true,
    autoSaveInterval: 30000, // 30 secondes
    maxRevisions: 10,
    requireApproval: true,
    allowScheduling: true
  },
  
  // Gestion des médias
  media: {
    uploadPath: '/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    generateWebP: true,
    optimizeImages: true,
    watermark: {
      enabled: false,
      position: 'bottom-right',
      opacity: 0.7
    }
  },
  
  // SEO et indexation
  seo: {
    autoGenerateMetadata: true,
    submitToSearchEngines: true,
    generateSitemap: true,
    robotsTxtEnabled: true,
    structuredDataEnabled: true
  },
  
  // Cache et performance
  cache: {
    staticGeneration: true,
    cacheHeaders: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    },
    cdnEnabled: true
  }
}

// Tâches de maintenance automatisées
export const maintenanceTasks = {
  // Nettoyage quotidien
  daily: [
    'cleanupTempFiles',
    'optimizeImages',
    'generateSitemap',
    'updateAnalytics'
  ],
  
  // Maintenance hebdomadaire
  weekly: [
    'cleanupOldRevisions',
    'updateSearchIndex',
    'generateReports',
    'backupContent'
  ],
  
  // Maintenance mensuelle
  monthly: [
    'archiveOldContent',
    'analyzePerformance',
    'updateDependencies',
    'securityAudit'
  ]
}
```

Ce guide fournit une base solide pour la gestion de contenu dans HerbisVeritas V2, en intégrant les meilleures pratiques des CMS headless modernes comme Strapi et Contentful, tout en respectant l'architecture Next.js et les spécificités du domaine de l'agriculture biologique.

L'approche modulaire permet une évolutivité facile et une maintenance simplifiée, tandis que l'intégration native avec le système d'authentification et les APIs existantes garantit une expérience utilisateur cohérente.