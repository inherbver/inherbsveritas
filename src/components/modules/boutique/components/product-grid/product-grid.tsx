'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/products/product-card-optimized'
import { ContentGrid, usePagination } from '@/components/ui/content-grid'
import { ProductFilters, Product } from '@/types/product'
import { useProducts } from '@/hooks/use-products'
import { Button } from '@/components/ui/button'

export interface ProductGridProps {
  initialFilters?: ProductFilters
  className?: string
}

export function ProductGrid({ initialFilters, className }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  
  const { products, loading, error, refetch } = useProducts({
    filters,
    limit: 12
  })
  
  const { paginationConfig } = usePagination(products, 12)

  const handleAddToCart = async (product: Product) => {
    try {
      // Mock implementation - in real app would use cart context/store
      console.log('Adding to cart:', product)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Show success message (would use toast system in real app)
      alert(`${product.name} ajouté au panier !`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Erreur lors de l\'ajout au panier')
    }
  }

  const handleToggleFavorite = (product: Product) => {
    // Mock implementation - in real app would use favorites context/store
    console.log('Toggling favorite:', product)
    alert(`${product.name} ${Math.random() > 0.5 ? 'ajouté aux' : 'retiré des'} favoris`)
  }

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Actions de filtrage pour ContentGrid
  const filterActions = (
    <div className="flex flex-wrap gap-4">
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={filters.search || ''}
        onChange={(e) => handleFilterChange({ search: e.target.value })}
        className="flex-1 min-w-[200px] px-3 py-2 border rounded-md"
      />
      <select
        value={filters.category || ''}
        onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">Toutes catégories</option>
        <option value="essential-oils">Huiles Essentielles</option>
        <option value="soaps">Savons</option>
        <option value="cosmetics">Cosmétiques</option>
      </select>
      {error && (
        <Button onClick={refetch} variant="outline">
          Réessayer
        </Button>
      )}
    </div>
  )

  return (
    <ContentGrid
      // Données
      items={products}
      renderItem={(product: Product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      
      // Configuration
      variant="product"
      className={className}
      
      // États
      isLoading={loading}
      loadingCount={8}
      error={error || undefined}
      emptyMessage="Aucun produit trouvé pour les critères sélectionnés."
      
      // Pagination
      pagination={paginationConfig}
      
      // Actions
      actions={filterActions}
      title="Nos Produits"
      description="Découvrez notre sélection de produits naturels et biologiques"
      
      // Interface
      allowViewToggle
    />
  )
}