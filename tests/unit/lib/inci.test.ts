/**
 * Tests pour le système INCI cosmétique
 * Validation conformité réglementation européenne
 */

import {
  findInciIngredient,
  validateInciList,
  formatInciList,
  getInciFunctions,
  getInciCommonName,
  INCI_DATABASE
} from '@/lib/inci'

describe('INCI System', () => {
  describe('findInciIngredient', () => {
    it('devrait trouver un ingrédient par nom INCI', () => {
      const results = findInciIngredient('Lavandula')
      expect(results).toHaveLength(1)
      expect(results[0].inci_name).toBe('Lavandula Angustifolia Oil')
    })

    it('devrait trouver un ingrédient par nom commun français', () => {
      const results = findInciIngredient('olive')
      expect(results).toHaveLength(1)
      expect(results[0].inci_name).toBe('Olea Europaea Fruit Oil')
    })

    it('devrait trouver un ingrédient par nom commun anglais', () => {
      const results = findInciIngredient('Shea Butter')
      expect(results).toHaveLength(1)
      expect(results[0].inci_name).toBe('Butyrospermum Parkii Butter')
    })

    it('devrait retourner un tableau vide si aucun résultat', () => {
      const results = findInciIngredient('ingredient inexistant')
      expect(results).toHaveLength(0)
    })

    it('devrait être insensible à la casse', () => {
      const results = findInciIngredient('OLEA EUROPAEA')
      expect(results).toHaveLength(1)
      expect(results[0].inci_name).toBe('Olea Europaea Fruit Oil')
    })
  })

  describe('validateInciList', () => {
    it('devrait valider une liste INCI correcte', () => {
      const result = validateInciList([
        'Olea Europaea Fruit Oil',
        'Lavandula Angustifolia Oil'
      ])
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter une liste vide', () => {
      const result = validateInciList([])
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('La liste INCI ne peut pas être vide')
    })

    it('devrait rejeter des noms INCI vides', () => {
      const result = validateInciList(['Olea Europaea Fruit Oil', '', 'Aloe Vera'])
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Nom INCI vide'))).toBe(true)
    })

    it('devrait identifier les allergènes', () => {
      const result = validateInciList(['Lavandula Angustifolia Oil'])
      
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Allergène potentiel'))).toBe(true)
    })

    it('devrait avertir pour les ingrédients non trouvés', () => {
      const result = validateInciList(['Ingredient Inconnu'])
      
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Non trouvé dans la base de données'))).toBe(true)
    })

    it('devrait avertir pour les formats non standards', () => {
      const result = validateInciList(['ingredient-avec-tirets'])
      
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Vérifier le format INCI standard'))).toBe(true)
    })
  })

  describe('formatInciList', () => {
    it('devrait formater correctement une liste INCI', () => {
      const formatted = formatInciList([
        'Olea Europaea Fruit Oil',
        'Lavandula Angustifolia Oil',
        'Aloe Barbadensis Leaf Juice'
      ])
      
      expect(formatted).toBe('Olea Europaea Fruit Oil, Lavandula Angustifolia Oil, Aloe Barbadensis Leaf Juice')
    })

    it('devrait nettoyer les espaces', () => {
      const formatted = formatInciList([
        '  Olea Europaea Fruit Oil  ',
        ' Lavandula Angustifolia Oil '
      ])
      
      expect(formatted).toBe('Olea Europaea Fruit Oil, Lavandula Angustifolia Oil')
    })

    it('devrait filtrer les entrées vides', () => {
      const formatted = formatInciList([
        'Olea Europaea Fruit Oil',
        '',
        'Aloe Barbadensis Leaf Juice',
        '   '
      ])
      
      expect(formatted).toBe('Olea Europaea Fruit Oil, Aloe Barbadensis Leaf Juice')
    })
  })

  describe('getInciFunctions', () => {
    it('devrait retourner les fonctions d\'un ingrédient connu', () => {
      const functions = getInciFunctions('Olea Europaea Fruit Oil')
      expect(functions).toContain('hydratant')
      expect(functions).toContain('adoucissant')
    })

    it('devrait retourner un tableau vide pour un ingrédient inconnu', () => {
      const functions = getInciFunctions('Ingredient Inconnu')
      expect(functions).toHaveLength(0)
    })

    it('devrait être insensible à la casse', () => {
      const functions = getInciFunctions('olea europaea fruit oil')
      expect(functions).toContain('hydratant')
    })
  })

  describe('getInciCommonName', () => {
    it('devrait retourner le nom commun français par défaut', () => {
      const commonName = getInciCommonName('Olea Europaea Fruit Oil')
      expect(commonName).toBe('Huile d\'olive')
    })

    it('devrait retourner le nom commun anglais si demandé', () => {
      const commonName = getInciCommonName('Olea Europaea Fruit Oil', 'en')
      expect(commonName).toBe('Olive Oil')
    })

    it('devrait retourner le nom INCI si pas de nom commun', () => {
      const commonName = getInciCommonName('Ingredient Inconnu')
      expect(commonName).toBe('Ingredient Inconnu')
    })

    it('devrait retourner le nom français si pas de nom anglais disponible', () => {
      // Chercher un ingrédient qui n'a que le nom français
      const ingredient = INCI_DATABASE.find(ing => !ing.common_name_en)
      if (ingredient) {
        const commonName = getInciCommonName(ingredient.inci_name, 'en')
        expect(commonName).toBe(ingredient.common_name_fr)
      }
    })
  })

  describe('INCI Database integrity', () => {
    it('devrait avoir une base de données non vide', () => {
      expect(INCI_DATABASE.length).toBeGreaterThan(0)
    })

    it('tous les ingrédients devraient avoir un nom INCI valide', () => {
      INCI_DATABASE.forEach(ingredient => {
        expect(ingredient.inci_name).toBeDefined()
        expect(ingredient.inci_name.length).toBeGreaterThan(0)
        expect(/^[A-Z]/.test(ingredient.inci_name)).toBe(true)
      })
    })

    it('tous les ingrédients devraient avoir un nom commun français', () => {
      INCI_DATABASE.forEach(ingredient => {
        expect(ingredient.common_name_fr).toBeDefined()
        expect(ingredient.common_name_fr.length).toBeGreaterThan(0)
      })
    })

    it('tous les ingrédients devraient avoir au moins une fonction', () => {
      INCI_DATABASE.forEach(ingredient => {
        expect(ingredient.function).toBeDefined()
        expect(ingredient.function.length).toBeGreaterThan(0)
      })
    })

    it('les numéros CAS devraient être au bon format si présents', () => {
      INCI_DATABASE.forEach(ingredient => {
        if (ingredient.cas_number) {
          // Format CAS: XXXXXX-XX-X ou XXXXX-XX-X ou XXXX-XX-X ou XXX-XX-X ou XX-XX-X
          expect(/^\d{2,6}-\d{2}-\d{1}$/.test(ingredient.cas_number)).toBe(true)
        }
      })
    })
  })
})