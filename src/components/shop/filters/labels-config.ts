import type { ProductLabel } from '@/types/database'

// Configuration labels HerbisVeritas
export const HERBIS_VERITAS_LABELS = [
  { key: 'bio' as ProductLabel, label: 'Bio', description: 'Certification biologique' },
  { key: 'recolte_main' as ProductLabel, label: 'Récolté à la main', description: 'Récolte manuelle traditionnelle' },
  { key: 'origine_occitanie' as ProductLabel, label: 'Origine Occitanie', description: 'Produits de notre région' },
  { key: 'partenariat_producteurs' as ProductLabel, label: 'Partenariat producteurs', description: 'Collaboration directe' },
  { key: 'rituel_bien_etre' as ProductLabel, label: 'Rituel bien-être', description: 'Pour votre routine beauté' },
  { key: 'essence_precieuse' as ProductLabel, label: 'Essence précieuse', description: 'Ingrédients rares et précieux' },
  { key: 'rupture_recolte' as ProductLabel, label: 'Rupture de récolte', description: 'Stock limité cette saison' }
] as const