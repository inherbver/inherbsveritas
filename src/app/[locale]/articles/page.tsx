/**
 * @file Page liste articles magazine
 * @description Liste des articles du magazine HerbisVeritas
 */

import * as React from "react"
import { Metadata } from "next"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ArticlesPageProps {
  params: { locale: string }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Magazine - HerbisVeritas',
    description: 'Découvrez nos articles sur les cosmétiques bio, les ingrédients naturels et les pratiques durables. Magazine HerbisVeritas.',
    openGraph: {
      title: 'Magazine HerbisVeritas',
      description: 'Articles cosmétiques bio et pratiques durables',
      type: 'website'
    }
  }
}

// Données temporaires articles (à remplacer par API)
const mockArticles = [
  {
    id: '1',
    slug: 'guide-ingredients-naturels-cosmetiques',
    title: 'Guide complet des ingrédients naturels en cosmétique',
    excerpt: 'Découvrez les bienfaits des ingrédients naturels les plus utilisés dans nos formulations artisanales.',
    content: 'Lorem ipsum dolor sit amet...',
    publishedAt: '2024-01-15',
    readingTime: 8,
    category: 'Ingrédients',
    tags: ['bio', 'naturel', 'ingrédients'],
    image: '/images/articles/ingredients-guide.jpg',
    author: 'Équipe HerbisVeritas'
  },
  {
    id: '2', 
    slug: 'routine-beaute-naturelle-hiver',
    title: 'Routine beauté naturelle pour l\'hiver',
    excerpt: 'Comment adapter votre routine de soins aux rigueurs de l\'hiver avec des produits 100% naturels.',
    content: 'Lorem ipsum dolor sit amet...',
    publishedAt: '2024-01-10',
    readingTime: 6,
    category: 'Conseils',
    tags: ['routine', 'hiver', 'soins'],
    image: '/images/articles/routine-hiver.jpg',
    author: 'Marie Dubois'
  },
  {
    id: '3',
    slug: 'fabrication-artisanale-savons',
    title: 'Dans les coulisses de notre fabrication artisanale',
    excerpt: 'Plongez dans notre atelier d\'Occitanie et découvrez les secrets de nos méthodes artisanales.',
    content: 'Lorem ipsum dolor sit amet...',
    publishedAt: '2024-01-08',
    readingTime: 10,
    category: 'Atelier',
    tags: ['artisanal', 'fabrication', 'savoir-faire'],
    image: '/images/articles/atelier-fabrication.jpg',
    author: 'Pierre Martin'
  },
  {
    id: '4',
    slug: 'labels-bio-comprendre-certifications',
    title: 'Labels bio : comprendre les certifications',
    excerpt: 'Décryptage des différents labels bio et de leur importance dans le choix de vos cosmétiques.',
    content: 'Lorem ipsum dolor sit amet...',
    publishedAt: '2024-01-05',
    readingTime: 5,
    category: 'Labels',
    tags: ['bio', 'certification', 'labels'],
    image: '/images/articles/labels-bio.jpg',
    author: 'Équipe HerbisVeritas'
  }
]

const categories = ['Tous', 'Ingrédients', 'Conseils', 'Atelier', 'Labels']

export default function ArticlesPage({ params }: ArticlesPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Magazine HerbisVeritas</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos articles sur les cosmétiques bio, les ingrédients naturels et les pratiques artisanales d&apos;Occitanie
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={category === 'Tous' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Article featured (premier article) */}
        {mockArticles.length > 0 && (
          <Card className="mb-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image article principal</span>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-3">{mockArticles[0]?.category}</Badge>
                <h2 className="text-2xl font-bold mb-4">
                  <Link 
                    href={`/${params.locale}/articles/${mockArticles[0]?.slug}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {mockArticles[0]?.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {mockArticles[0]?.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Par {mockArticles[0]?.author}</span>
                  <div className="flex items-center gap-4">
                    <span>{mockArticles[0]?.readingTime} min de lecture</span>
                    <span>{mockArticles[0]?.publishedAt ? new Date(mockArticles[0].publishedAt).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Grille articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockArticles.slice(1).map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Image article</span>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <span className="text-xs text-gray-500">
                    {article.readingTime} min
                  </span>
                </div>
                <h3 className="text-lg font-semibold leading-tight">
                  <Link 
                    href={`/${params.locale}/articles/${article.slug}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Par {article.author}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border rounded hover:bg-gray-50" disabled>
              ← Précédent
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded">
              1
            </button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              Suivant →
            </button>
          </div>
        </div>

        {/* Newsletter signup */}
        <Card className="mt-16 bg-green-50">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Recevez nos derniers articles et conseils beauté naturelle directement dans votre boîte mail
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input 
                type="email" 
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                S&apos;inscrire
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}