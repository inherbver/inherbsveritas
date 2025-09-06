/**
 * @file Page Nous rencontrer - Contact + Partenaires fusionnés
 * @description Page combinée : formulaire de contact + points de vente partenaires
 */

import * as React from "react"
import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nous rencontrer - HerbisVeritas',
    description: 'Contactez-nous ou retrouvez-nous dans nos points de vente partenaires. HerbisVeritas, cosmétiques bio artisanaux d\'Occitanie.',
    openGraph: {
      title: 'Nous rencontrer - HerbisVeritas',
      description: 'Contact et points de vente HerbisVeritas',
      type: 'website'
    }
  }
}

// Données temporaires partenaires (à remplacer par API)
const mockPartners = [
  {
    id: '1',
    name: 'Pharmacie Bio Montpellier',
    type: 'Pharmacie',
    address: '15 rue de la République, 34000 Montpellier',
    phone: '04 67 58 42 31',
    email: 'contact@pharma-bio-mtp.fr',
    specialties: ['Cosmétiques bio', 'Aromathérapie']
  },
  {
    id: '2',
    name: 'Marché Bio de Nîmes',
    type: 'Marché',
    address: 'Place aux Herbes, 30000 Nîmes',
    phone: '06 12 34 56 78',
    schedule: 'Samedi matin 8h-13h',
    specialties: ['Produits locaux', 'Bio certifié']
  },
  {
    id: '3',
    name: 'Boutique Nature & Bien-être',
    type: 'Boutique spécialisée',
    address: '8 avenue Victor Hugo, 11000 Carcassonne',
    phone: '04 68 25 47 59',
    email: 'hello@nature-bienetre.fr',
    website: 'www.nature-bienetre.fr',
    specialties: ['Cosmétiques naturels', 'Bien-être']
  }
]

export default function NousRencontrerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header de page */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nous rencontrer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Contactez-nous directement ou retrouvez nos produits chez nos partenaires de confiance en Occitanie
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Nous contacter</h2>
              
              {/* Informations de contact */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>HerbisVeritas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Atelier-Laboratoire</h4>
                    <p className="text-gray-600">
                      Route des Herbes Sauvages<br />
                      12345 Village d&apos;Occitanie<br />
                      France
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-gray-600">
                      Email : <a href="mailto:contact@herbisveritas.fr" className="text-blue-600 hover:underline">contact@herbisveritas.fr</a><br />
                      Téléphone : <a href="tel:+33467584231" className="text-blue-600 hover:underline">04 67 58 42 31</a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Horaires d&apos;ouverture</h4>
                    <p className="text-gray-600">
                      Lundi - Vendredi : 9h - 17h<br />
                      Weekend : Sur rendez-vous
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Formulaire de contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" action="#" method="POST">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nom" className="block text-sm font-medium mb-2">
                          Nom *
                        </label>
                        <Input id="nom" name="nom" required />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email *
                        </label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="sujet" className="block text-sm font-medium mb-2">
                        Sujet
                      </label>
                      <Input id="sujet" name="sujet" />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={5}
                        placeholder="Décrivez votre demande..."
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section Partenaires/Points de vente */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Nos points de vente</h2>
            <p className="text-gray-600 mb-6">
              Retrouvez nos produits HerbisVeritas chez nos partenaires sélectionnés pour leur engagement envers la qualité et le bio.
            </p>

            <div className="space-y-6">
              {mockPartners.map((partner) => (
                <Card key={partner.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {partner.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Adresse</h4>
                      <p className="text-sm text-gray-600">{partner.address}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {partner.phone && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700">Téléphone</h4>
                          <a href={`tel:${partner.phone.replace(/\s/g, '')}`} 
                             className="text-sm text-blue-600 hover:underline">
                            {partner.phone}
                          </a>
                        </div>
                      )}
                      
                      {partner.email && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700">Email</h4>
                          <a href={`mailto:${partner.email}`} 
                             className="text-sm text-blue-600 hover:underline">
                            {partner.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {partner.schedule && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">Horaires</h4>
                        <p className="text-sm text-gray-600">{partner.schedule}</p>
                      </div>
                    )}

                    {partner.website && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">Site web</h4>
                        <a href={`https://${partner.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-sm text-blue-600 hover:underline">
                          {partner.website}
                        </a>
                      </div>
                    )}

                    {partner.specialties && partner.specialties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Spécialités</h4>
                        <div className="flex flex-wrap gap-1">
                          {partner.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call-to-action pour devenir partenaire */}
            <Card className="mt-8 bg-green-50">
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Devenir partenaire</h3>
                <p className="text-gray-600 mb-4">
                  Vous êtes professionnel et souhaitez distribuer nos produits ?
                </p>
                <Button variant="outline">
                  Nous contacter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}