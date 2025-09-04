// INCI Service - Phase GREEN TDD
// Implémentation pour faire passer tests Red

/**
 * INCI (International Nomenclature of Cosmetic Ingredients) Service
 * Gestion des listes d'ingrédients cosmétiques selon standards internationaux
 */

export interface InciIngredient {
  name: string;
  isOrganic: boolean;
  isAllergen: boolean;
  function?: string;
  origin?: 'plant' | 'synthetic' | 'mineral' | 'animal';
  description?: {
    fr: string;
    en: string;
  };
}

export interface InciParseResult {
  ingredients: InciIngredient[];
  allergens: InciIngredient[];
  organicIngredients: InciIngredient[];
  errors: string[];
}

// EU Allergens list (mandatory disclosure if >0.01% in rinse-off, >0.001% in leave-on)
const EU_ALLERGENS = [
  'Limonene',
  'Linalool', 
  'Citral',
  'Geraniol',
  'Citronellol',
  'Benzyl Alcohol',
  'Benzyl Benzoate',
  'Benzyl Cinnamate',
  'Benzyl Salicylate',
  'Cinnamyl Alcohol',
  'Cinnamal',
  'Coumarin',
  'Eugenol',
  'Farnesol',
  'Hexyl Cinnamal',
  'Hydroxycitronellal',
  'Hydroxyisohexyl 3-cyclohexene Carboxaldehyde',
  'Isoeugenol',
  'Amyl Cinnamal',
  'Anise Alcohol',
  'Benzyl Cinnamate',
  'Methyl 2-octynoate'
];

// Common cosmetic ingredients database (simplified for MVP)
const INGREDIENT_DATABASE: Record<string, Partial<InciIngredient>> = {
  'Aqua': {
    function: 'Solvent',
    origin: 'mineral',
    description: {
      fr: 'Eau purifiée, solvant principal',
      en: 'Purified water, main solvent'
    }
  },
  'Glycerin': {
    function: 'Humectant',
    origin: 'plant',
    description: {
      fr: 'Agent hydratant, retient l\'humidité',
      en: 'Moisturizing agent, retains moisture'
    }
  },
  'Aloe Barbadensis Leaf Juice': {
    function: 'Soothing agent',
    origin: 'plant',
    description: {
      fr: 'Jus d\'aloé vera, apaisant et hydratant',
      en: 'Aloe vera juice, soothing and moisturizing'
    }
  },
  'Sodium Cocoyl Glutamate': {
    function: 'Surfactant',
    origin: 'plant',
    description: {
      fr: 'Tensioactif doux dérivé de coco',
      en: 'Gentle coconut-derived surfactant'
    }
  },
  'Coco-Glucoside': {
    function: 'Surfactant',
    origin: 'plant',
    description: {
      fr: 'Tensioactif doux issu du coco et glucose',
      en: 'Gentle surfactant from coconut and glucose'
    }
  },
  'Xanthan Gum': {
    function: 'Thickener',
    origin: 'synthetic',
    description: {
      fr: 'Épaississant naturel fermenté',
      en: 'Natural fermented thickener'
    }
  },
  'Parfum': {
    function: 'Fragrance',
    origin: 'synthetic',
    description: {
      fr: 'Parfum, peut contenir des allergènes',
      en: 'Fragrance, may contain allergens'
    }
  },
  // Add allergens
  ...EU_ALLERGENS.reduce((acc, allergen) => {
    acc[allergen] = {
      function: 'Fragrance component',
      origin: 'synthetic',
      description: {
        fr: `Composant de parfum, allergène déclaré`,
        en: `Fragrance component, declared allergen`
      }
    };
    return acc;
  }, {} as Record<string, Partial<InciIngredient>>)
};

export class InciService {
  /**
   * Parse INCI string to structured ingredients list
   */
  parseInciString(inciString: string): string[] {
    if (!inciString || inciString.trim() === '') {
      return [];
    }

    // Clean and split by comma
    return inciString
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  }

  /**
   * Parse INCI ingredients with detailed analysis
   */
  parseInciList(inciList: string[]): InciParseResult {
    const ingredients: InciIngredient[] = [];
    const allergens: InciIngredient[] = [];
    const organicIngredients: InciIngredient[] = [];
    const errors: string[] = [];

    for (const ingredientName of inciList) {
      try {
        const parsedIngredient = this.parseIngredient(ingredientName);
        ingredients.push(parsedIngredient);

        if (parsedIngredient.isAllergen) {
          allergens.push(parsedIngredient);
        }

        if (parsedIngredient.isOrganic) {
          organicIngredients.push(parsedIngredient);
        }
      } catch (error) {
        errors.push(`Error parsing ingredient "${ingredientName}": ${error}`);
      }
    }

    return {
      ingredients,
      allergens,
      organicIngredients,
      errors
    };
  }

  /**
   * Parse single ingredient with organic indicator
   */
  parseIngredient(ingredientName: string): InciIngredient {
    const trimmed = ingredientName.trim();
    
    // Check for organic indicator (asterisk suffix)
    const isOrganic = trimmed.endsWith('*');
    const cleanName = isOrganic ? trimmed.slice(0, -1).trim() : trimmed;
    
    // Check if allergen
    const isAllergen = this.isAllergen(cleanName);
    
    // Get ingredient info from database
    const dbInfo = INGREDIENT_DATABASE[cleanName] || {};

    return {
      name: cleanName,
      isOrganic,
      isAllergen,
      ...(dbInfo.function && { function: dbInfo.function }),
      ...(dbInfo.origin && { origin: dbInfo.origin }),
      ...(dbInfo.description && { description: dbInfo.description })
    };
  }

  /**
   * Check if ingredient is a known allergen
   */
  isAllergen(ingredientName: string): boolean {
    return EU_ALLERGENS.includes(ingredientName);
  }

  /**
   * Get allergens from ingredient list
   */
  detectAllergens(inciList: string[]): string[] {
    return inciList.filter(ingredient => {
      const cleanName = ingredient.replace('*', '').trim();
      return this.isAllergen(cleanName);
    });
  }

  /**
   * Get allergen information
   */
  getAllergenInfo(allergenName: string): { name: string; description: { fr: string; en: string } } | null {
    if (!this.isAllergen(allergenName)) {
      return null;
    }

    return {
      name: allergenName,
      description: {
        fr: `${allergenName} est un allergène qui doit être déclaré selon la réglementation européenne`,
        en: `${allergenName} is an allergen that must be declared according to European regulations`
      }
    };
  }

  /**
   * Get ingredient function/description
   */
  getIngredientInfo(ingredientName: string): Partial<InciIngredient> | null {
    const cleanName = ingredientName.replace('*', '').trim();
    return INGREDIENT_DATABASE[cleanName] || null;
  }

  /**
   * Normalize ingredient name (remove asterisks, trim, proper case)
   */
  normalizeInciName(ingredientName: string): string {
    return ingredientName.replace('*', '').trim();
  }

  /**
   * Validate INCI format compliance
   */
  validateInciList(inciList: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!inciList || inciList.length === 0) {
      errors.push('INCI list cannot be empty');
      return { isValid: false, errors };
    }

    // Check for valid Latin names (basic validation)
    for (const ingredient of inciList) {
      const cleanName = this.normalizeInciName(ingredient);
      
      if (cleanName.length < 2) {
        errors.push(`Ingredient name too short: "${ingredient}"`);
      }

      // Check for invalid characters (very basic)
      if (!/^[a-zA-Z0-9\s\-\(\),\.]+$/.test(cleanName)) {
        errors.push(`Invalid characters in ingredient name: "${ingredient}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get ingredient origin statistics
   */
  getOriginStatistics(ingredients: InciIngredient[]): Record<string, number> {
    const stats: Record<string, number> = {
      plant: 0,
      synthetic: 0,
      mineral: 0,
      animal: 0,
      unknown: 0
    };

    ingredients.forEach(ingredient => {
      const origin = ingredient.origin || 'unknown';
      stats[origin] = (stats[origin] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate ingredient compliance report
   */
  generateComplianceReport(ingredients: InciIngredient[], locale: 'fr' | 'en' = 'fr'): {
    totalIngredients: number;
    allergenCount: number;
    organicCount: number;
    originBreakdown: Record<string, number>;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const allergenCount = ingredients.filter(i => i.isAllergen).length;
    const organicCount = ingredients.filter(i => i.isOrganic).length;

    // Generate warnings
    if (allergenCount > 0) {
      warnings.push(
        locale === 'fr' 
          ? `${allergenCount} allergène(s) présent(s) - déclaration obligatoire`
          : `${allergenCount} allergen(s) present - mandatory declaration required`
      );
    }

    // Generate recommendations
    if (organicCount > 0) {
      recommendations.push(
        locale === 'fr'
          ? `${organicCount} ingrédient(s) bio - mettre en avant sur l'emballage`
          : `${organicCount} organic ingredient(s) - highlight on packaging`
      );
    }

    return {
      totalIngredients: ingredients.length,
      allergenCount,
      organicCount,
      originBreakdown: this.getOriginStatistics(ingredients),
      warnings,
      recommendations
    };
  }
}

// Export singleton
export const inciService = new InciService();