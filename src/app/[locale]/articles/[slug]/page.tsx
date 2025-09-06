/**
 * @file Page article détail
 * @description Article détaillé du magazine HerbisVeritas
 */

import * as React from "react"
import { Metadata } from "next"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ArticlePageProps {
  params: { 
    locale: string
    slug: string 
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  // TODO: Récupérer les métadonnées de l'article depuis l'API
  const articleTitle = params.slug.replace(/-/g, ' ')
  
  return {
    title: `${articleTitle} - Magazine HerbisVeritas`,
    description: `Découvrez cet article du magazine HerbisVeritas sur les cosmétiques bio et les pratiques artisanales.`,
    openGraph: {
      title: `${articleTitle} - HerbisVeritas`,
      description: 'Article du magazine HerbisVeritas',
      type: 'article'
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // TODO: Récupérer l'article par slug depuis l'API
  // const article = await articlesService.getArticleBySlug(params.slug)
  
  // Simulation données article (à remplacer par vraie API)
  const mockArticle = {
    id: '1',
    slug: params.slug,
    title: params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    excerpt: 'Découvrez les secrets de nos méthodes artisanales et de nos ingrédients naturels d\'Occitanie.',
    content: `
      <p>Les cosmétiques naturels représentent bien plus qu'une simple tendance : ils incarnent un retour aux sources, une recherche d'authenticité dans nos routines beauté. Chez HerbisVeritas, cette philosophie guide chacune de nos créations depuis nos débuts.</p>

      <h2>L'art de sélectionner les ingrédients</h2>
      
      <p>Chaque ingrédient qui entre dans nos formulations fait l'objet d'une sélection rigoureuse. Nous privilégions les producteurs locaux d'Occitanie, créant ainsi une chaîne vertueuse qui soutient l'économie régionale tout en garantissant la fraîcheur et la qualité de nos matières premières.</p>

      <p>Notre démarche s'appuie sur trois critères fondamentaux :</p>
      <ul>
        <li><strong>La traçabilité :</strong> Connaître l'origine exacte de chaque composant</li>
        <li><strong>La durabilité :</strong> Privilégier les méthodes de culture respectueuses</li>
        <li><strong>L'efficacité :</strong> Sélectionner les ingrédients aux propriétés avérées</li>
      </ul>

      <h2>Notre processus de fabrication artisanale</h2>
      
      <p>Dans notre atelier d'Occitanie, chaque produit est confectionné à la main, en petites quantités. Cette approche artisanale nous permet de maintenir un contrôle qualité optimal et de préserver l'intégrité des ingrédients actifs.</p>

      <p>Le processus de saponification à froid, par exemple, préserve toutes les propriétés hydratantes des huiles végétales. Cette méthode traditionnelle, bien que plus longue, garantit un produit final d'une qualité exceptionnelle.</p>

      <blockquote>
        "Nous ne fabriquons pas des cosmétiques en série, nous créons des soins uniques, porteurs de notre savoir-faire et de nos valeurs." - Équipe HerbisVeritas
      </blockquote>

      <h2>Les bienfaits des ingrédients d'Occitanie</h2>
      
      <p>Notre région regorge de plantes aux propriétés cosmétiques remarquables :</p>
      
      <ul>
        <li><strong>La lavande :</strong> Apaisante et parfumante naturelle</li>
        <li><strong>Le thym :</strong> Purifiant et antioxydant</li>
        <li><strong>L'olivier :</strong> Nourrissant et protecteur</li>
        <li><strong>Le romarin :</strong> Stimulant et tonifiant</li>
      </ul>

      <p>Ces ingrédients, cultivés sous le soleil méditerranéen, concentrent des actifs puissants que nous savons préserver et valoriser dans nos formulations.</p>

      <h2>L'engagement HerbisVeritas</h2>
      
      <p>Au-delà de la qualité de nos produits, nous nous engageons pour un mode de consommation plus responsable. Nos emballages sont conçus pour être réutilisés ou recyclés, et nous privilégions les circuits courts pour limiter notre impact environnemental.</p>

      <p>Cette démarche globale fait de chaque produit HerbisVeritas le témoin d'une cosmétique consciente et respectueuse, tant pour votre peau que pour notre planète.</p>
    `,
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    readingTime: 8,
    category: 'Artisanal',
    tags: ['artisanal', 'ingrédients', 'occitanie', 'fabrication'],
    image: '/images/articles/article-hero.jpg',
    author: {
      name: 'Équipe HerbisVeritas',
      bio: 'Artisans cosmétiques passionnés par les traditions d\'Occitanie',
      avatar: '/images/authors/equipe.jpg'
    },
    seo: {
      metaTitle: 'Les secrets de la fabrication artisanale HerbisVeritas',
      metaDescription: 'Découvrez notre approche artisanale des cosmétiques bio et les trésors d\'Occitanie.'
    }
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href={`/${params.locale}/articles`} className="hover:text-gray-700">
            Magazine
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{mockArticle.title}</span>
        </nav>

        {/* Header article */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge>{mockArticle.category}</Badge>
            <span className="text-sm text-gray-500">
              {mockArticle.readingTime} minutes de lecture
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {mockArticle.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {mockArticle.excerpt}
          </p>

          <div className="flex items-center justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">👤</span>
              </div>
              <div>
                <p className="font-medium">{mockArticle.author.name}</p>
                <p className="text-sm text-gray-500">{mockArticle.author.bio}</p>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <p>Publié le {new Date(mockArticle.publishedAt).toLocaleDateString('fr-FR')}</p>
              {mockArticle.updatedAt !== mockArticle.publishedAt && (
                <p>Mis à jour le {new Date(mockArticle.updatedAt).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </div>
        </header>

        {/* Image principale */}
        <div className="aspect-video bg-gray-200 rounded-lg mb-8 flex items-center justify-center">
          <span className="text-gray-400">Image de l&apos;article</span>
        </div>

        {/* Contenu article */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: mockArticle.content }}
            className="[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 
                       [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
                       [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-gray-700
                       [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:ml-6
                       [&>blockquote]:border-l-4 [&>blockquote]:border-green-500 
                       [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-8
                       [&>blockquote]:bg-gray-50 [&>blockquote]:italic
                       [&>strong]:font-semibold [&>strong]:text-gray-900"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {mockArticle.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Partage social */}
        <Card className="mb-12">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold mb-1">Cet article vous a plu ?</h3>
              <p className="text-sm text-gray-600">Partagez-le avec vos proches</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Articles suggérés */}
        <section>
          <h2 className="text-2xl font-semibold mb-8">Articles suggérés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                slug: 'routine-beaute-naturelle-hiver',
                title: 'Routine beauté naturelle pour l\'hiver',
                excerpt: 'Adapter ses soins aux rigueurs hivernales avec des produits naturels.',
                category: 'Conseils',
                readingTime: 6
              },
              {
                slug: 'labels-bio-comprendre-certifications',
                title: 'Labels bio : comprendre les certifications',
                excerpt: 'Décryptage des différents labels et leur importance.',
                category: 'Labels',
                readingTime: 5
              }
            ].map((suggestedArticle) => (
              <Card key={suggestedArticle.slug} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Image article</span>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{suggestedArticle.category}</Badge>
                    <span className="text-xs text-gray-500">{suggestedArticle.readingTime} min</span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    <Link 
                      href={`/${params.locale}/articles/${suggestedArticle.slug}`}
                      className="hover:text-green-600 transition-colors"
                    >
                      {suggestedArticle.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {suggestedArticle.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Retour à la liste */}
        <div className="text-center mt-12">
          <Link href={`/${params.locale}/articles`}>
            <Button variant="outline">
              ← Retour au magazine
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}