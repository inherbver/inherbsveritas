'use client'

/**
 * ContentCard - Composant générique unifié
 * 
 * Remplace ProductCard, ArticleCard, PartnerCard pour un système cohérent
 * Basé sur l'analyse ANALYSE_COMPOSANTS_SHARED_COMPONENTS.md
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// CVA pour les variants de carte
const contentCardVariants = cva(
  "group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        product: "aspect-square sm:aspect-[4/5] cursor-pointer hover:scale-[1.02]",
        article: "aspect-[16/9] sm:aspect-[3/2] cursor-pointer hover:scale-[1.01]",
        partner: "aspect-[2/1] cursor-pointer",
        event: "aspect-video cursor-pointer"
      },
      layout: {
        default: "flex flex-col",
        compact: "flex flex-row space-x-4 p-4 aspect-auto",
        featured: "flex flex-col lg:flex-row lg:space-x-6 aspect-auto",
        horizontal: "flex flex-row aspect-auto"
      },
      size: {
        sm: "p-3",
        md: "p-4", 
        lg: "p-6"
      }
    },
    defaultVariants: {
      variant: "product",
      layout: "default",
      size: "md"
    }
  }
);

// Types pour les interfaces
export interface ContentCardBadge {
  label: string;
  variant: 'new' | 'promo' | 'category' | 'status' | 'bio' | 'recolte' | 'origine' | 'partenariat' | 'rituel' | 'rupture' | 'essence';
  color?: string;
}

export interface ContentCardAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant: 'default' | 'secondary' | 'ghost' | 'link';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
}

export interface ContentCardMetadata {
  author?: string;
  date?: Date | string;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  views?: number;
  stock?: number;
  inStock?: boolean;
}

export interface ContentCardProps extends VariantProps<typeof contentCardVariants> {
  // Identification
  id: string;
  slug?: string;
  title: string;
  
  // Contenu
  description?: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  
  // Métadonnées flexibles
  metadata?: ContentCardMetadata;
  
  // États et actions
  badges?: ContentCardBadge[];
  actions?: ContentCardAction[];
  
  // Comportement
  onClick?: () => void;
  href?: string;
  isLoading?: boolean;
  
  // Styling
  className?: string;
  
  // Slots pour contenu custom (ex: INCI list)
  customContent?: React.ReactNode;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
}

export function ContentCard({
  // Identité
  id,
  slug,
  title,
  description,
  excerpt,
  imageUrl,
  imageAlt,
  
  // Structure
  metadata,
  badges = [],
  actions = [],
  
  // Comportement
  onClick,
  href,
  isLoading = false,
  
  // Styling
  variant,
  layout,
  size,
  className,
  
  // Custom content
  customContent,
  headerSlot,
  footerSlot,
}: ContentCardProps) {
  
  // Formatage du prix
  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Formatage de la date
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  // Wrapper conditionnel pour les liens
  const WrapperComponent = href ? Link : 'div';
  const wrapperProps = href ? { href } : { onClick };

  if (isLoading) {
    return (
      <article className={cn(contentCardVariants({ variant, layout, size }), className)}>
        <div className="animate-pulse">
          <div className="bg-muted aspect-square rounded-t-lg" />
          <div className="p-4">
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <WrapperComponent {...wrapperProps}>
      <article 
        className={cn(contentCardVariants({ variant, layout, size }), className)}
        itemScope 
        itemType={variant === 'product' ? "https://schema.org/Product" : "https://schema.org/Article"}
      >
        {/* Header slot personnalisable */}
        {headerSlot && (
          <CardHeader className="p-0">
            {headerSlot}
          </CardHeader>
        )}

        {/* Image principale avec badges overlay */}
        {imageUrl && layout === 'default' && (
          <div className="relative overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={variant === 'product' ? 
                "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" :
                "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
            />
            
            {/* Badges overlay */}
            {badges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    variant={badge.variant as any}
                    className="text-xs"
                    style={badge.color ? { backgroundColor: badge.color } : undefined}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <CardContent className={layout === 'compact' ? "flex-1" : "p-4"}>
          {/* Image pour layout compact/horizontal */}
          {imageUrl && layout !== 'default' && (
            <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden mr-4">
              <Image
                src={imageUrl}
                alt={imageAlt || title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}

          <div className="flex-1">
            {/* Titre */}
            <h3 
              className="font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors"
              itemProp={variant === 'product' ? 'name' : 'headline'}
            >
              {title}
            </h3>

            {/* Description/Excerpt */}
            {(description || excerpt) && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {description || excerpt}
              </p>
            )}

            {/* Métadonnées */}
            {metadata && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                {/* Prix pour produits */}
                {metadata.price && (
                  <span className="font-medium text-primary" itemProp="price">
                    {formatPrice(metadata.price, metadata.currency)}
                  </span>
                )}
                
                {/* Catégorie */}
                {metadata.category && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    {metadata.category}
                  </span>
                )}
                
                {/* Date pour articles */}
                {metadata.date && (
                  <span itemProp="datePublished">
                    {formatDate(metadata.date)}
                  </span>
                )}
                
                {/* Auteur pour articles */}
                {metadata.author && (
                  <span itemProp="author">
                    par {metadata.author}
                  </span>
                )}
                
                {/* Temps de lecture */}
                {metadata.readTime && (
                  <span>{metadata.readTime} min</span>
                )}
                
                {/* Stock */}
                {typeof metadata.stock === 'number' && (
                  <span className={metadata.stock > 0 ? "text-green-600" : "text-red-600"}>
                    {metadata.stock > 0 ? "En stock" : "Épuisé"}
                  </span>
                )}
              </div>
            )}

            {/* Badges pour layout compact */}
            {badges.length > 0 && layout !== 'default' && (
              <div className="flex flex-wrap gap-1 mb-2">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    variant={badge.variant as any}
                    className="text-xs"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Contenu personnalisé (ex: INCI list) */}
            {customContent}
          </div>
        </CardContent>

        {/* Actions Footer */}
        {(actions.length > 0 || footerSlot) && (
          <CardFooter className="p-4 pt-0 flex gap-2">
            {footerSlot}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="flex-1"
              >
                {action.loading && (
                  <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-2" />
                )}
                {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </CardFooter>
        )}
      </article>
    </WrapperComponent>
  );
}