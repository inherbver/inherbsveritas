/**
 * INCI (International Nomenclature of Cosmetic Ingredients)
 * Système de référence obligatoire EU pour étiquetage cosmétique
 * 
 * Selon règlement européen (CE) N°1223/2009
 */

// Types INCI pour cosmétiques
export interface InciIngredient {
  /** Nom INCI officiel */
  inci_name: string
  /** Nom commun français */
  common_name_fr: string
  /** Nom commun anglais */
  common_name_en?: string
  /** Fonction cosmétique */
  function: InciFunction[]
  /** Origine (naturelle, synthétique, etc.) */
  origin?: InciOrigin
  /** Numéro CAS si disponible */
  cas_number?: string
  /** Restrictions ou allergènes */
  allergen?: boolean
  /** Notes spéciales */
  notes?: string
}

export type InciFunction = 
  | 'emulsifiant'         // Émulsifiant
  | 'hydratant'          // Agent hydratant
  | 'conservateur'       // Conservateur
  | 'parfum'            // Parfum/Fragrance
  | 'colorant'          // Colorant
  | 'antioxydant'       // Antioxydant
  | 'actif'             // Principe actif
  | 'tensioactif'       // Tensioactif/Nettoyant
  | 'epaississant'      // Épaississant
  | 'adoucissant'       // Émollient/Adoucissant
  | 'stabilisant'       // Stabilisant
  | 'regulateur_ph'     // Régulateur de pH

export type InciOrigin = 
  | 'naturel'           // Ingrédient naturel
  | 'bio'              // Certifié biologique
  | 'synthetique'      // Synthétique
  | 'mineral'          // Minéral
  | 'derive_naturel'   // Dérivé naturel

// Base INCI HerbisVeritas (ingrédients cosmétiques bio courants)
export const INCI_DATABASE: InciIngredient[] = [
  // Huiles végétales
  {
    inci_name: 'Olea Europaea Fruit Oil',
    common_name_fr: 'Huile d\'olive',
    common_name_en: 'Olive Oil',
    function: ['hydratant', 'adoucissant'],
    origin: 'naturel',
    cas_number: '8001-25-0'
  },
  {
    inci_name: 'Lavandula Angustifolia Oil',
    common_name_fr: 'Huile essentielle de lavande vraie',
    common_name_en: 'True Lavender Essential Oil',
    function: ['parfum', 'actif'],
    origin: 'naturel',
    allergen: true,
    notes: 'Contient linalool, limonene'
  },
  {
    inci_name: 'Cocos Nucifera Oil',
    common_name_fr: 'Huile de coco',
    common_name_en: 'Coconut Oil',
    function: ['hydratant', 'adoucissant'],
    origin: 'naturel',
    cas_number: '8001-31-8'
  },
  {
    inci_name: 'Butyrospermum Parkii Butter',
    common_name_fr: 'Beurre de karité',
    common_name_en: 'Shea Butter',
    function: ['hydratant', 'adoucissant'],
    origin: 'naturel',
    cas_number: '91080-23-8'
  },

  // Beurres et cires
  {
    inci_name: 'Cera Alba',
    common_name_fr: 'Cire d\'abeille',
    common_name_en: 'Beeswax',
    function: ['emulsifiant', 'epaississant'],
    origin: 'naturel',
    cas_number: '8006-40-4'
  },
  {
    inci_name: 'Candelilla Cera',
    common_name_fr: 'Cire de candelilla',
    common_name_en: 'Candelilla Wax',
    function: ['epaississant', 'emulsifiant'],
    origin: 'naturel',
    cas_number: '8006-44-8'
  },

  // Actifs cosmétiques naturels
  {
    inci_name: 'Aloe Barbadensis Leaf Juice',
    common_name_fr: 'Jus d\'aloe vera',
    common_name_en: 'Aloe Vera Juice',
    function: ['hydratant', 'actif'],
    origin: 'naturel',
    cas_number: '85507-69-3'
  },
  {
    inci_name: 'Chamomilla Recutita Flower Extract',
    common_name_fr: 'Extrait de camomille',
    common_name_en: 'Chamomile Extract',
    function: ['actif', 'antioxydant'],
    origin: 'naturel',
    allergen: true
  },
  {
    inci_name: 'Calendula Officinalis Flower Extract',
    common_name_fr: 'Extrait de calendula',
    common_name_en: 'Calendula Extract',
    function: ['actif', 'antioxydant'],
    origin: 'naturel'
  },

  // Tensioactifs doux
  {
    inci_name: 'Sodium Cocoyl Glutamate',
    common_name_fr: 'Tensioactif doux dérivé coco',
    common_name_en: 'Gentle Coconut-derived Surfactant',
    function: ['tensioactif'],
    origin: 'derive_naturel',
    cas_number: '68187-32-6'
  },
  {
    inci_name: 'Coco Glucoside',
    common_name_fr: 'Tensioactif végétal',
    common_name_en: 'Plant-based Surfactant',
    function: ['tensioactif'],
    origin: 'derive_naturel',
    cas_number: '141464-42-8'
  },

  // Conservateurs naturels
  {
    inci_name: 'Tocopherol',
    common_name_fr: 'Vitamine E',
    common_name_en: 'Vitamin E',
    function: ['antioxydant', 'conservateur'],
    origin: 'naturel',
    cas_number: '10191-41-0'
  },
  {
    inci_name: 'Rosmarinus Officinalis Leaf Extract',
    common_name_fr: 'Extrait de romarin',
    common_name_en: 'Rosemary Extract',
    function: ['antioxydant', 'conservateur'],
    origin: 'naturel'
  },

  // Régulateurs pH et stabilisants
  {
    inci_name: 'Citric Acid',
    common_name_fr: 'Acide citrique',
    common_name_en: 'Citric Acid',
    function: ['regulateur_ph'],
    origin: 'derive_naturel',
    cas_number: '77-92-9'
  },
  {
    inci_name: 'Xanthan Gum',
    common_name_fr: 'Gomme xanthane',
    common_name_en: 'Xanthan Gum',
    function: ['epaississant', 'stabilisant'],
    origin: 'derive_naturel',
    cas_number: '11138-66-2'
  }
]

// Utilitaires INCI

/**
 * Rechercher un ingrédient INCI par nom
 */
export function findInciIngredient(query: string): InciIngredient[] {
  const searchTerm = query.toLowerCase()
  return INCI_DATABASE.filter(ingredient => 
    ingredient.inci_name.toLowerCase().includes(searchTerm) ||
    ingredient.common_name_fr.toLowerCase().includes(searchTerm) ||
    ingredient.common_name_en?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Valider une liste INCI (format réglementaire)
 */
export function validateInciList(inciList: string[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Vérifier que la liste n'est pas vide
  if (!inciList || inciList.length === 0) {
    errors.push('La liste INCI ne peut pas être vide')
    return { valid: false, errors, warnings }
  }

  // Vérifier le format des noms INCI
  inciList.forEach((inci, index) => {
    if (!inci || inci.trim().length === 0) {
      errors.push(`Ingrédient ${index + 1}: Nom INCI vide`)
      return
    }

    // Format INCI : Première lettre majuscule, espaces autorisés
    if (!/^[A-Z][a-zA-Z\s]+$/.test(inci.trim())) {
      warnings.push(`Ingrédient ${index + 1}: "${inci}" - Vérifier le format INCI standard`)
    }

    // Vérifier si l'ingrédient est dans notre base
    const found = INCI_DATABASE.find(ingredient => 
      ingredient.inci_name.toLowerCase() === inci.toLowerCase()
    )
    
    if (!found) {
      warnings.push(`Ingrédient ${index + 1}: "${inci}" - Non trouvé dans la base de données`)
    } else if (found.allergen) {
      warnings.push(`Ingrédient ${index + 1}: "${inci}" - Allergène potentiel`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Formater la liste INCI pour affichage (réglementation EU)
 */
export function formatInciList(inciList: string[]): string {
  return inciList
    .map(inci => inci.trim())
    .filter(inci => inci.length > 0)
    .join(', ')
}

/**
 * Obtenir les fonctions d'un ingrédient INCI
 */
export function getInciFunctions(inciName: string): InciFunction[] {
  const ingredient = INCI_DATABASE.find(
    ing => ing.inci_name.toLowerCase() === inciName.toLowerCase()
  )
  return ingredient?.function || []
}

/**
 * Obtenir le nom commun d'un ingrédient INCI
 */
export function getInciCommonName(inciName: string, locale: 'fr' | 'en' = 'fr'): string {
  const ingredient = INCI_DATABASE.find(
    ing => ing.inci_name.toLowerCase() === inciName.toLowerCase()
  )
  
  if (!ingredient) return inciName
  
  return locale === 'fr' 
    ? ingredient.common_name_fr 
    : ingredient.common_name_en || ingredient.common_name_fr
}

// Labels fonction pour UI
export const INCI_FUNCTION_LABELS: Record<InciFunction, { fr: string; en: string }> = {
  'emulsifiant': { fr: 'Émulsifiant', en: 'Emulsifier' },
  'hydratant': { fr: 'Hydratant', en: 'Moisturizer' },
  'conservateur': { fr: 'Conservateur', en: 'Preservative' },
  'parfum': { fr: 'Parfum', en: 'Fragrance' },
  'colorant': { fr: 'Colorant', en: 'Colorant' },
  'antioxydant': { fr: 'Antioxydant', en: 'Antioxidant' },
  'actif': { fr: 'Principe actif', en: 'Active ingredient' },
  'tensioactif': { fr: 'Tensioactif', en: 'Surfactant' },
  'epaississant': { fr: 'Épaississant', en: 'Thickener' },
  'adoucissant': { fr: 'Émollient', en: 'Emollient' },
  'stabilisant': { fr: 'Stabilisant', en: 'Stabilizer' },
  'regulateur_ph': { fr: 'Régulateur pH', en: 'pH Adjuster' }
}