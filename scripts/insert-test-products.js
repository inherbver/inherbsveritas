const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Configuration Supabase:')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? '✅ Présente' : '❌ Manquante')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testProducts = [
  {
    slug: 'savon-lavande-artisanal',
    category_id: '4133e9e1-960d-4232-b2b9-e4e8090c3035',
    name: 'Savon Artisanal à la Lavande',
    description_short: 'Savon surgras enrichi à l\'huile essentielle de lavande de Provence',
    description_long: 'Savon traditionnel fabriqué selon les méthodes artisanales occitanes. Enrichi à 8% en beurre de karité bio et huile d\'olive première pression.',
    price: 12.90,
    stock: 25,
    unit: 'pièce',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_1.webp',
    inci_list: ['Sodium Olivate', 'Aqua', 'Butyrospermum Parkii Butter', 'Lavandula Angustifolia Oil'],
    labels: ['bio', 'recolte_main', 'partenariat_producteurs'],
    is_new: true
  },
  {
    slug: 'huile-essentielle-eucalyptus',
    category_id: '2459ad65-120e-4076-84ae-d83966d98b37',
    name: 'Huile Essentielle Eucalyptus Radiata',
    description_short: 'Huile essentielle pure d\'eucalyptus radiata, récolte 2024',
    description_long: 'Eucalyptus radiata distillé dans nos ateliers à partir de feuilles fraîches récoltées en Occitanie.',
    price: 18.50,
    stock: 15,
    unit: '10ml',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_2.webp',
    inci_list: ['Eucalyptus Radiata Leaf Oil'],
    labels: ['bio', 'origine_occitanie', 'essence_precieuse'],
    is_new: false
  },
  {
    slug: 'creme-visage-miel',
    category_id: '98f531d5-e128-428f-999e-5e4946b4ab4b',
    name: 'Crème Visage Miel & Propolis',
    description_short: 'Soin nourrissant au miel de châtaignier et propolis des Cévennes',
    description_long: 'Crème onctueuse formulée avec du miel de châtaignier récolté dans les Cévennes et de la propolis purifiée.',
    price: 28.00,
    stock: 12,
    unit: '50ml',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_3.webp',
    inci_list: ['Aqua', 'Butyrospermum Parkii Butter', 'Simmondsia Chinensis Oil', 'Mel', 'Propolis Extract'],
    labels: ['bio', 'partenariat_producteurs', 'rituel_bien_etre'],
    is_new: true
  },
  {
    slug: 'deodorant-solide',
    category_id: '98f531d5-e128-428f-999e-5e4946b4ab4b',
    name: 'Déodorant Solide Palmarosa',
    description_short: 'Protection 24h aux huiles essentielles de palmarosa et tea tree',
    description_long: 'Déodorant solide ultra-efficace formulé sans sels d\'aluminium.',
    price: 9.50,
    stock: 30,
    unit: 'stick 75g',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_4.webp',
    inci_list: ['Cocos Nucifera Oil', 'Butyrospermum Parkii Butter', 'Zea Mays Starch'],
    labels: ['bio', 'recolte_main'],
    is_new: false
  },
  {
    slug: 'tisane-digestive',
    category_id: '2459ad65-120e-4076-84ae-d83966d98b37',
    name: 'Tisane Digestive d\'Occitanie',
    description_short: 'Mélange de plantes digestives: verveine, tilleul, mélisse',
    description_long: 'Tisane composée de plantes aromatiques sélectionnées et séchées selon les traditions occitanes.',
    price: 14.20,
    stock: 20,
    unit: 'sachet 50g',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_5.webp',
    inci_list: null,
    labels: ['bio', 'origine_occitanie', 'rituel_bien_etre'],
    is_new: false
  },
  {
    slug: 'baume-calendula',
    category_id: '98f531d5-e128-428f-999e-5e4946b4ab4b',
    name: 'Baume Réparateur au Calendula',
    description_short: 'Soin intensif aux macérats de calendula et millepertuis',
    description_long: 'Baume concentré aux propriétés cicatrisantes et apaisantes.',
    price: 16.80,
    stock: 18,
    unit: '30ml',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_6.webp',
    inci_list: ['Helianthus Annuus Oil', 'Cera Alba', 'Calendula Officinalis Extract'],
    labels: ['bio', 'recolte_main', 'partenariat_producteurs'],
    is_new: true
  },
  {
    slug: 'huile-massage-detente',
    category_id: '98f531d5-e128-428f-999e-5e4946b4ab4b',
    name: 'Huile de Massage Détente',
    description_short: 'Synergie relaxante lavande vraie, petit grain et ylang-ylang',
    description_long: 'Huile de massage aux propriétés relaxantes exceptionnelles.',
    price: 24.90,
    stock: 8,
    unit: '100ml',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_1.webp',
    inci_list: ['Helianthus Annuus Oil', 'Lavandula Angustifolia Oil'],
    labels: ['bio', 'origine_occitanie', 'rituel_bien_etre'],
    is_new: false
  },
  {
    slug: 'shampoing-solide',
    category_id: '4133e9e1-960d-4232-b2b9-e4e8090c3035',
    name: 'Shampoing Solide Cheveux Gras',
    description_short: 'Formule purifiante à l\'argile verte et huiles essentielles',
    description_long: 'Shampoing solide spécialement formulé pour les cheveux gras.',
    price: 11.40,
    stock: 22,
    unit: 'galet 60g',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_2.webp',
    inci_list: ['Sodium Cocoyl Glutamate', 'Illite', 'Rosmarinus Officinalis Oil'],
    labels: ['bio', 'origine_occitanie'],
    is_new: true
  },
  {
    slug: 'bougie-figuier',
    category_id: '98f531d5-e128-428f-999e-5e4946b4ab4b',
    name: 'Bougie Parfumée Figuier de Provence',
    description_short: 'Cire végétale parfumée aux notes vertes et lactées du figuier',
    description_long: 'Bougie artisanale coulée dans nos ateliers à partir de cire de soja bio.',
    price: 32.00,
    stock: 6,
    unit: 'pot 200g',
    image_url: 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_3.webp',
    inci_list: ['Soja Wax', 'Parfum Figuier Provence', 'Cotton Wick'],
    labels: ['bio', 'origine_occitanie', 'rituel_bien_etre', 'essence_precieuse'],
    is_new: true
  }
]

async function insertTestProducts() {
  try {
    console.log('🔄 Insertion des produits de test...')
    
    const { data, error } = await supabase
      .from('products')
      .insert(testProducts)
      .select()
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error)
      return
    }
    
    console.log(`✅ ${data.length} produits insérés avec succès!`)
    console.log('📋 Produits créés:')
    data.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ${product.price}€`)
    })
    
  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}

insertTestProducts()