'use client'

/**
 * ArticleCard - Wrapper ContentCard pour Articles Magazine
 * 
 * Version optimisée utilisant ContentCard générique variant="article"
 * Implémentation en 30 minutes vs 2-3 jours from scratch
 */

import * as React from "react"
import { Share2, Bookmark } from "lucide-react"
import { ContentCard, type ContentCardAction, type ContentCardBadge } from "@/components/ui/content-card"

// Types pour les articles (temporaire - à intégrer avec types principaux)
export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl?: string
  author: string
  publishedAt: Date | string
  readingTime: number // minutes
  viewCount?: number
  categories: ArticleCategory[]
  tags?: string[]
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  color?: string
}

export interface ArticleCardProps {
  /** Article data */
  article: Article
  /** Callback when sharing article */
  onShare?: (article: Article) => void
  /** Callback when bookmarking */
  onBookmark?: (article: Article) => void
  /** Show reading stats */
  showStats?: boolean
  /** Visual variant */
  variant?: 'default' | 'compact' | 'featured'
  /** Custom className */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

export function ArticleCard({
  article,
  onShare,
  onBookmark,
  showStats = true,
  variant = 'default',
  className,
  isLoading = false
}: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  // Actions article spécialisées
  const articleActions: ContentCardAction[] = []

  // Action partage
  if (onShare) {
    articleActions.push({
      label: 'Partager',
      onClick: () => onShare(article),
      variant: 'ghost',
      icon: Share2
    })
  }

  // Action bookmark
  if (onBookmark) {
    articleActions.push({
      label: isBookmarked ? 'Retiré' : 'Sauvegarder',
      onClick: () => {
        setIsBookmarked(!isBookmarked)
        onBookmark(article)
      },
      variant: 'ghost',
      icon: Bookmark
    })
  }

  // Badges d'état et catégories
  const articleBadges: ContentCardBadge[] = []

  // Badges catégories
  article.categories.forEach(category => {
    articleBadges.push({
      label: category.name,
      variant: 'category',
      ...(category.color && { color: category.color })
    })
  })

  // Badge article featured
  if (article.isFeatured) {
    articleBadges.push({
      label: 'À la une',
      variant: 'new'
    })
  }

  // Badge statut si pas publié
  if (article.status !== 'published') {
    articleBadges.push({
      label: article.status === 'draft' ? 'Brouillon' : 'Archivé',
      variant: article.status === 'draft' ? 'status' : 'rupture'
    })
  }

  // Métadonnées article
  const articleMetadata = {
    author: article.author,
    date: article.publishedAt,
    readTime: article.readingTime,
    ...(showStats && article.viewCount && { views: article.viewCount })
  }

  // Contenu personnalisé tags
  const tagsContent = article.tags && article.tags.length > 0 && variant !== 'compact' && (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center text-xs text-muted-foreground mb-2">
        <span>Tags:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {article.tags.slice(0, 4).map(tag => (
          <span 
            key={tag}
            className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
          >
            #{tag}
          </span>
        ))}
        {article.tags.length > 4 && (
          <span className="text-xs text-muted-foreground">
            +{article.tags.length - 4}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <ContentCard
      // Identification
      slug={article.slug}
      title={article.title}
      excerpt={article.excerpt}
      {...(article.imageUrl && { imageUrl: article.imageUrl })}
      imageAlt={article.title}
      
      // Configuration spécialisée article
      variant="article" // Aspect 16/9 adapté aux articles
      layout={variant === 'compact' ? 'compact' : 
               variant === 'featured' ? 'featured' : 'default'}
      
      // Données
      metadata={articleMetadata}
      badges={articleBadges}
      actions={articleActions}
      
      // Navigation
      href={`/magazine/${article.slug}`}
      
      // État
      isLoading={isLoading}
      {...(className && { className })}
      
      // Contenu spécialisé tags
      customContent={tagsContent}
    />
  )
}

// Hook utilitaire pour formater les données article
export function useArticleFormatting(locale: 'fr' | 'en' = 'fr') {
  const formatReadingTime = React.useCallback((minutes: number) => {
    return locale === 'fr' ? `${minutes} min de lecture` : `${minutes} min read`
  }, [locale])

  const formatViewCount = React.useCallback((count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }, [])

  const formatPublishDate = React.useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(dateObj)
  }, [locale])

  return {
    formatReadingTime,
    formatViewCount,
    formatPublishDate
  }
}

