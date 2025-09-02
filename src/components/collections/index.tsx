'use client'

/**
 * Collections Components - Wrappers ContentGrid spécialisés
 * 
 * ProductGrid, ArticleGrid, CategoryGrid utilisant ContentGrid générique
 * Démonstration du système shared components unifié
 */

import * as React from "react"
import { ContentGrid, type ContentGridProps, usePagination } from "@/components/ui/content-grid"
import { ProductCard } from "@/components/products/product-card-optimized"
import { ArticleCard, type Article } from "@/components/content/article-card"
import { CategoryCard } from "@/components/content/category-card"
import { Product } from "@/types/product"
import { CategoryTree } from "@/types/herbis-veritas"

// === ProductGrid - E-commerce Collections ===
export interface ProductGridProps extends Omit<ContentGridProps<Product>, 'items' | 'renderItem' | 'variant'> {
  products: Product[]
  onAddToCart?: (product: Product) => Promise<void>
  onToggleFavorite?: (product: Product) => void
  showFilters?: boolean
  sortBy?: 'price' | 'name' | 'newest' | 'popular'
}

export function ProductGrid({
  products,
  onAddToCart,
  onToggleFavorite,
  showFilters = false,
  sortBy = 'name',
  ...gridProps
}: ProductGridProps) {
  const { paginationConfig } = usePagination(products, 12)

  // Actions globales produits
  const productActions = showFilters && (
    <div className="flex items-center gap-4">
      {/* TODO: Filtres par catégorie, prix, labels */}
      <select className="border rounded px-3 py-2 text-sm">
        <option value="">Toutes catégories</option>
      </select>
      <select 
        className="border rounded px-3 py-2 text-sm"
        defaultValue={sortBy}
      >
        <option value="name">Nom A-Z</option>
        <option value="price">Prix croissant</option>
        <option value="newest">Plus récent</option>
        <option value="popular">Populaire</option>
      </select>
    </div>
  )

  return (
    <ContentGrid
      variant="product"
      items={products}
      renderItem={(product) => (
        <ProductCard
          product={product}
          {...(onAddToCart && { onAddToCart })}
          {...(onToggleFavorite && { onToggleFavorite })}
        />
      )}
      title="Nos Produits"
      description={`${products.length} produits cosmétiques naturels`}
      emptyMessage="Aucun produit disponible pour le moment"
      pagination={paginationConfig}
      actions={productActions}
      allowViewToggle={true}
      {...gridProps}
    />
  )
}

// === ArticleGrid - Magazine Collections ===
export interface ArticleGridProps extends Omit<ContentGridProps<Article>, 'items' | 'renderItem' | 'variant'> {
  articles: Article[]
  onShare?: (article: Article) => void
  onBookmark?: (article: Article) => void
  showCategories?: boolean
  featuredFirst?: boolean
}

export function ArticleGrid({
  articles,
  onShare,
  onBookmark,
  showCategories = true,
  featuredFirst = true,
  ...gridProps
}: ArticleGridProps) {
  // Tri articles : featured en premier
  const sortedArticles = React.useMemo(() => {
    if (!featuredFirst) return articles
    
    return [...articles].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return 0
    })
  }, [articles, featuredFirst])

  const { paginationConfig } = usePagination(sortedArticles, 9)

  // Actions globales magazine
  const magazineActions = showCategories && (
    <div className="flex items-center gap-4">
      {/* TODO: Filtres par catégorie, tags */}
      <select className="border rounded px-3 py-2 text-sm">
        <option value="">Toutes catégories</option>
        <option value="cosmetique">Cosmétique</option>
        <option value="bien-etre">Bien-être</option>
        <option value="diy">DIY</option>
      </select>
    </div>
  )

  return (
    <ContentGrid
      variant="article"
      items={sortedArticles}
      renderItem={(article) => (
        <ArticleCard
          article={article}
          {...(onShare && { onShare })}
          {...(onBookmark && { onBookmark })}
          showStats={true}
        />
      )}
      title="Magazine HerbisVeritas"
      description={`${articles.length} articles et conseils beauté naturelle`}
      emptyMessage="Aucun article publié pour le moment"
      pagination={paginationConfig}
      actions={magazineActions}
      allowViewToggle={true}
      {...gridProps}
    />
  )
}

// === CategoryGrid - Admin Collections ===
export interface CategoryGridProps extends Omit<ContentGridProps<CategoryTree>, 'items' | 'renderItem' | 'variant'> {
  categories: CategoryTree[]
  locale?: 'fr' | 'en'
  onEdit?: (category: CategoryTree) => void
  onDelete?: (category: CategoryTree) => void
  onAddChild?: (category: CategoryTree) => void
  showProductCount?: boolean
  adminMode?: boolean
}

export function CategoryGrid({
  categories,
  locale = 'fr',
  onEdit,
  onDelete,
  onAddChild,
  showProductCount = false,
  adminMode = false,
  ...gridProps
}: CategoryGridProps) {
  const { paginationConfig } = usePagination(categories, 6)

  // Actions admin categories  
  const categoryActions = adminMode && (
    <div className="flex items-center gap-4">
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
        + Nouvelle catégorie
      </button>
      <select className="border rounded px-3 py-2 text-sm">
        <option value="all">Toutes</option>
        <option value="active">Actives</option>
        <option value="inactive">Inactives</option>
      </select>
    </div>
  )

  return (
    <ContentGrid
      variant="category"
      items={categories}
      renderItem={(category) => (
        <CategoryCard
          category={category}
          locale={locale}
          {...(onEdit && { onEdit })}
          {...(onDelete && { onDelete })}
          {...(onAddChild && { onAddChild })}
          showProductCount={showProductCount}
          variant={adminMode ? 'admin' : 'default'}
        />
      )}
      title="Catégories"
      description={`${categories.length} catégories organisées`}
      emptyMessage="Aucune catégorie créée"
      pagination={paginationConfig}
      actions={categoryActions}
      {...gridProps}
    />
  )
}

// === Exemple d'usage complet ===
export function CollectionsDemo() {
  // Mock data
  const products: Product[] = [] // TODO: Fetch real data
  const articles: Article[] = [] // TODO: Fetch real data  
  const categories: CategoryTree[] = [] // TODO: Fetch real data

  const handleAddToCart = async (product: Product) => {
    console.log('Add to cart:', product.id)
  }

  const handleShareArticle = (article: Article) => {
    navigator.share({
      title: article.title,
      text: article.excerpt,
      url: `/magazine/${article.slug}`
    })
  }

  return (
    <div className="space-y-12">
      {/* Collection produits */}
      <section>
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          showFilters={true}
          className="mb-8"
        />
      </section>

      {/* Collection articles */}
      <section>
        <ArticleGrid
          articles={articles}
          onShare={handleShareArticle}
          showCategories={true}
          className="mb-8"
        />
      </section>

      {/* Collection catégories admin */}
      <section>
        <CategoryGrid
          categories={categories}
          adminMode={true}
          showProductCount={true}
          className="mb-8"
        />
      </section>
    </div>
  )
}