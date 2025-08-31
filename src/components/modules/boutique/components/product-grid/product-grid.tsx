'use client'

import { useState } from 'react'
import { ProductCard } from '../product-card'
import { ProductFilters, Product } from '@/types/product'
import { useProducts } from '@/hooks/use-products'
import { Button, ProductGridSkeleton } from '@/components/ui'

interface ProductGridProps {
  initialFilters?: ProductFilters
  className?: string
}

export function ProductGrid({ initialFilters, className }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [page, setPage] = useState(1)

  const { products, loading, error, pagination, refetch } = useProducts({
    filters,
    page,
    limit: 12
  })

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

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={refetch} variant="default">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Filter Bar - Simple for now */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
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
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <ProductGridSkeleton count={8} />
      )}

      {/* Products Grid */}
      {!loading || page > 1 ? (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Aucun produit trouvé pour les critères sélectionnés.
              </p>
              <Button 
                onClick={() => handleFilterChange({ search: '', category: undefined })}
                variant="default"
                className="mt-4"
              >
                Effacer les filtres
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Chargement...' : 'Charger plus de produits'}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center text-gray-500 text-sm">
            {pagination.total > 0 && (
              <p>
                {products.length} sur {pagination.total} produit{pagination.total > 1 ? 's' : ''}
                {filters.search && ` pour "${filters.search}"`}
                {filters.category && ` dans la catégorie sélectionnée`}
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}