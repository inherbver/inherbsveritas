/**
 * ROOT: HERBISVERITAS LABELS — BUSINESS RULES
 * 7 labels fixes (pas extensible MVP):
 *  - recolte_main, bio, origine_occitanie, partenariat_producteurs, 
 *    rituel_bien_etre, rupture_recolte, essence_precieuse
 * LABEL_DISPLAY: mapping label -> texte affiché
 * LABEL_BADGE_VARIANTS: mapping label -> classe CSS variant
 * Interdits: ajout de nouveaux labels sans validation métier + bump DTO_VERSION
 */

import type { ProductLabel } from '@/lib/types/domain/product'

// 7 labels HerbisVeritas fixes (business requirement)
export const HERBIS_VERITAS_LABELS: readonly ProductLabel[] = [
  'recolte_main',
  'bio', 
  'origine_occitanie',
  'partenariat_producteurs',
  'rituel_bien_etre',
  'rupture_recolte',
  'essence_precieuse'
] as const

// Mapping label -> texte affiché (Single Source of Truth)
export const LABEL_DISPLAY: Record<ProductLabel, string> = {
  'recolte_main': 'Récolté à la main',
  'bio': 'Bio',
  'origine_occitanie': 'Origine Occitanie',
  'partenariat_producteurs': 'Partenariat producteurs',
  'rituel_bien_etre': 'Rituel bien-être',
  'rupture_recolte': 'Rupture de récolte',
  'essence_precieuse': 'Essence précieuse'
} as const

// Mapping label -> variant CSS pour badges
export const LABEL_BADGE_VARIANTS: Record<ProductLabel, string> = {
  'bio': 'bio',
  'recolte_main': 'recolte',
  'origine_occitanie': 'origine',
  'partenariat_producteurs': 'partenariat',
  'rituel_bien_etre': 'rituel',
  'rupture_recolte': 'rupture',
  'essence_precieuse': 'essence'
} as const

// Mapping label -> couleur de badge (pour UI consistency)
export const LABEL_COLORS: Record<ProductLabel, string> = {
  'bio': '#22c55e',           // green-500
  'recolte_main': '#f59e0b',  // amber-500
  'origine_occitanie': '#3b82f6', // blue-500
  'partenariat_producteurs': '#8b5cf6', // violet-500
  'rituel_bien_etre': '#ec4899', // pink-500
  'rupture_recolte': '#ef4444', // red-500
  'essence_precieuse': '#f59e0b' // amber-500
} as const

// Mapping label -> description longue (pour tooltips)
export const LABEL_DESCRIPTIONS: Record<ProductLabel, string> = {
  'bio': 'Produit certifié biologique selon les normes européennes',
  'recolte_main': 'Plantes récoltées manuellement pour préserver leur qualité',
  'origine_occitanie': 'Produit originaire de la région Occitanie',
  'partenariat_producteurs': 'En partenariat direct avec les producteurs locaux',
  'rituel_bien_etre': 'Spécialement conçu pour vos rituels de bien-être',
  'rupture_recolte': 'Disponibilité limitée due aux conditions de récolte',
  'essence_precieuse': 'Contient des essences rares et précieuses'
} as const

// Helpers pour validation et usage

/**
 * Vérifie qu'un label est valide HerbisVeritas
 */
export function isValidHerbisVeritasLabel(label: string): label is ProductLabel {
  return HERBIS_VERITAS_LABELS.includes(label as ProductLabel)
}

/**
 * Filtre une liste de labels pour ne garder que les valides
 */
export function filterValidLabels(labels: string[]): ProductLabel[] {
  return labels.filter(isValidHerbisVeritasLabel)
}

/**
 * Récupère le texte d'affichage pour un label
 */
export function getLabelDisplay(label: ProductLabel): string {
  return LABEL_DISPLAY[label]
}

/**
 * Récupère la variant CSS pour un label
 */
export function getLabelBadgeVariant(label: ProductLabel): string {
  return LABEL_BADGE_VARIANTS[label]
}

/**
 * Récupère la couleur pour un label
 */
export function getLabelColor(label: ProductLabel): string {
  return LABEL_COLORS[label]
}

/**
 * Récupère la description pour un label
 */
export function getLabelDescription(label: ProductLabel): string {
  return LABEL_DESCRIPTIONS[label]
}

/**
 * Convertit une liste de labels en textes d'affichage
 */
export function labelsToDisplayTexts(labels: ProductLabel[]): string[] {
  return labels.map(label => LABEL_DISPLAY[label])
}

/**
 * Trie les labels par ordre de priorité business
 */
export function sortLabelsByPriority(labels: ProductLabel[]): ProductLabel[] {
  const priority: Record<ProductLabel, number> = {
    'bio': 1,
    'origine_occitanie': 2,
    'recolte_main': 3,
    'partenariat_producteurs': 4,
    'essence_precieuse': 5,
    'rituel_bien_etre': 6,
    'rupture_recolte': 7
  }
  
  return [...labels].sort((a, b) => priority[a] - priority[b])
}

// Constantes métier
export const LABEL_CONSTANTS = {
  MAX_LABELS_PER_PRODUCT: 7, // Tous les labels possibles
  PRIORITY_LABELS: ['bio', 'origine_occitanie'] as ProductLabel[],
  WARNING_LABELS: ['rupture_recolte'] as ProductLabel[]
} as const

// Types utilitaires
export type LabelDisplayText = typeof LABEL_DISPLAY[ProductLabel]
export type LabelBadgeVariant = typeof LABEL_BADGE_VARIANTS[ProductLabel]
export type LabelColor = typeof LABEL_COLORS[ProductLabel]