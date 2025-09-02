/**
 * Tests TDD pour la validation Zod des addresses HerbisVeritas
 * Tests écrits AVANT implémentation des forms (Red phase TDD)
 */

import { 
  addressCreateSchema,
  addressUpdateSchema,
  addressValidation 
} from '@/lib/addresses/address-validation'
import { z } from 'zod'

describe('Address Validation - TDD Red Phase', () => {
  describe('🔴 Schema Zod (Tests écrits AVANT validation)', () => {
    describe('addressCreateSchema', () => {
      it('devrait valider adresse française complète', () => {
        // ARRANGE
        const validAddress = {
          type: 'shipping' as const,
          first_name: 'Jean',
          last_name: 'Dupont',
          address_line_1: '123 Rue de la République',
          city: 'Lyon', 
          postal_code: '69000',
          country: 'FR'
        }

        // ACT - Va échouer car schema pas encore implémenté
        const result = addressCreateSchema.safeParse(validAddress)

        // ASSERT
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validAddress)
        }
      })

      it('devrait valider adresse avec champs optionnels', () => {
        // ARRANGE
        const addressWithOptionals = {
          type: 'billing' as const,
          first_name: 'Marie',
          last_name: 'Martin',
          company: 'SARL Martin & Co',
          address_line_1: '456 Avenue des Champs',
          address_line_2: 'Bâtiment A - Étage 3',
          city: 'Paris',
          postal_code: '75008',
          country: 'FR',
          phone: '+33 1 23 45 67 89'
        }

        // ACT
        const result = addressCreateSchema.safeParse(addressWithOptionals)

        // ASSERT
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.company).toBe('SARL Martin & Co')
          expect(result.data.address_line_2).toBe('Bâtiment A - Étage 3')
          expect(result.data.phone).toBe('+33 1 23 45 67 89')
        }
      })

      it('devrait rejeter champs requis manquants', () => {
        // ARRANGE - Adresse incomplète
        const incompleteAddress = {
          type: 'shipping' as const,
          first_name: 'Jean',
          // last_name manquant
          address_line_1: '123 Rue Test',
          // city manquant
          postal_code: '69000',
          country: 'FR'
        }

        // ACT
        const result = addressCreateSchema.safeParse(incompleteAddress)

        // ASSERT
        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = result.error.errors.map(e => e.path.join('.'))
          expect(errors).toContain('last_name')
          expect(errors).toContain('city')
        }
      })

      it('devrait valider type d\'adresse (shipping/billing)', () => {
        // ARRANGE
        const validTypes = ['shipping', 'billing']
        const invalidTypes = ['home', 'work', 'other']

        validTypes.forEach(type => {
          const address = {
            type,
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test St',
            city: 'Test City',
            postal_code: '75001',
            country: 'FR'
          }

          // ACT
          const result = addressCreateSchema.safeParse(address)

          // ASSERT
          expect(result.success).toBe(true)
        })

        invalidTypes.forEach(type => {
          const address = {
            type,
            first_name: 'Test',
            last_name: 'User', 
            address_line_1: '123 Test St',
            city: 'Test City',
            postal_code: '75001',
            country: 'FR'
          }

          // ACT
          const result = addressCreateSchema.safeParse(address)

          // ASSERT
          expect(result.success).toBe(false)
        })
      })

      it('devrait nettoyer et formater les inputs', () => {
        // ARRANGE - Inputs "sales" avec espaces/casse
        const messyAddress = {
          type: '  SHIPPING  ' as any,
          first_name: '  jean  ',
          last_name: '  DUPONT  ',
          company: '  sarl test   ',
          address_line_1: '  123 rue de la paix  ',
          address_line_2: '  étage 2  ',
          city: '  PARIS  ',
          postal_code: ' 75001 ',
          country: ' fr ',
          phone: '  +33 1 23 45 67 89  '
        }

        // ACT
        const result = addressCreateSchema.safeParse(messyAddress)

        // ASSERT - Doit nettoyer et normaliser
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.type).toBe('shipping')
          expect(result.data.first_name).toBe('Jean') // Capitalisé
          expect(result.data.last_name).toBe('Dupont')
          expect(result.data.city).toBe('Paris')
          expect(result.data.postal_code).toBe('75001')
          expect(result.data.country).toBe('FR') // Uppercase
          expect(result.data.phone).toBe('+33123456789') // Formaté
        }
      })
    })

    describe('addressUpdateSchema', () => {
      it('devrait permettre mise à jour partielle', () => {
        // ARRANGE - Seulement quelques champs
        const partialUpdate = {
          city: 'Marseille',
          postal_code: '13000'
        }

        // ACT
        const result = addressUpdateSchema.safeParse(partialUpdate)

        // ASSERT
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.city).toBe('Marseille')
          expect(result.data.postal_code).toBe('13000')
        }
      })

      it('devrait interdire modification du type après création', () => {
        // ARRANGE - Tentative changement type
        const updateWithType = {
          type: 'billing',
          city: 'Lyon'
        }

        // ACT
        const result = addressUpdateSchema.safeParse(updateWithType)

        // ASSERT - Type non modifiable
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).not.toHaveProperty('type')
        }
      })
    })

    describe('Validation codes postaux par pays', () => {
      const postalCodeTests = [
        // France
        { country: 'FR', code: '75001', valid: true },
        { country: 'FR', code: '13000', valid: true },
        { country: 'FR', code: '97400', valid: true }, // DOM-TOM
        { country: 'FR', code: '7500', valid: false }, // Trop court
        { country: 'FR', code: '750000', valid: false }, // Trop long
        { country: 'FR', code: 'ABCDE', valid: false }, // Non numérique
        
        // États-Unis
        { country: 'US', code: '90210', valid: true },
        { country: 'US', code: '90210-1234', valid: true }, // ZIP+4
        { country: 'US', code: '9021', valid: false }, // Trop court
        { country: 'US', code: 'ABCDE', valid: false },
        
        // Canada
        { country: 'CA', code: 'H3B 1X9', valid: true },
        { country: 'CA', code: 'H3B1X9', valid: true }, // Sans espace
        { country: 'CA', code: 'h3b1x9', valid: true }, // Minuscules
        { country: 'CA', code: 'H3B1X', valid: false }, // Incomplet
        { country: 'CA', code: '12345', valid: false }, // Format US invalide pour CA
      ]

      postalCodeTests.forEach(({ country, code, valid }) => {
        it(`devrait ${valid ? 'accepter' : 'rejeter'} "${code}" pour ${country}`, () => {
          // ARRANGE
          const address = {
            type: 'shipping' as const,
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test Street',
            city: 'Test City',
            postal_code: code,
            country
          }

          // ACT
          const result = addressCreateSchema.safeParse(address)

          // ASSERT
          expect(result.success).toBe(valid)
          if (!valid && !result.success) {
            expect(
              result.error.errors.some(e => 
                e.path.includes('postal_code') || 
                e.message.includes('code postal')
              )
            ).toBe(true)
          }
        })
      })
    })

    describe('Validation téléphones', () => {
      const phoneTests = [
        // France
        { phone: '+33123456789', valid: true },
        { phone: '+33 1 23 45 67 89', valid: true }, // Avec espaces
        { phone: '01.23.45.67.89', valid: true }, // Format français
        { phone: '0123456789', valid: true }, // National
        { phone: '123456', valid: false }, // Trop court
        { phone: '+33abcdefghi', valid: false }, // Lettres
        
        // International
        { phone: '+1234567890', valid: true },
        { phone: '+44123456789', valid: true },
        { phone: '+49123456789', valid: true },
      ]

      phoneTests.forEach(({ phone, valid }) => {
        it(`devrait ${valid ? 'accepter' : 'rejeter'} le téléphone "${phone}"`, () => {
          // ARRANGE
          const address = {
            type: 'billing' as const,
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test Street',
            city: 'Test City',
            postal_code: '75001',
            country: 'FR',
            phone
          }

          // ACT
          const result = addressCreateSchema.safeParse(address)

          // ASSERT
          if (valid) {
            expect(result.success).toBe(true)
          } else {
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(
                result.error.errors.some(e => 
                  e.path.includes('phone') || 
                  e.message.includes('téléphone')
                )
              ).toBe(true)
            }
          }
        })
      })
    })
  })

  describe('🔴 Helpers de validation (Tests utilitaires)', () => {
    describe('addressValidation.formatPostalCode', () => {
      it('devrait formater code postal français', () => {
        // ACT - Helpers pas encore implémentés
        const formatted = addressValidation.formatPostalCode('7 5 0 0 1', 'FR')

        // ASSERT
        expect(formatted).toBe('75001')
      })

      it('devrait formater code postal canadien', () => {
        // ACT
        const formatted = addressValidation.formatPostalCode('h3b1x9', 'CA')

        // ASSERT
        expect(formatted).toBe('H3B 1X9')
      })
    })

    describe('addressValidation.formatPhone', () => {
      it('devrait formater téléphone français', () => {
        // ACT
        const formatted = addressValidation.formatPhone('01 23 45 67 89', 'FR')

        // ASSERT
        expect(formatted).toBe('+33123456789')
      })

      it('devrait conserver téléphone international', () => {
        // ACT
        const formatted = addressValidation.formatPhone('+1234567890', 'US')

        // ASSERT
        expect(formatted).toBe('+1234567890')
      })
    })

    describe('addressValidation.validateCountryPostal', () => {
      it('devrait valider combinaison pays/code postal', () => {
        // ACT - Tests logique métier
        const frenchValid = addressValidation.validateCountryPostal('75001', 'FR')
        const frenchInvalid = addressValidation.validateCountryPostal('90210', 'FR')
        const usValid = addressValidation.validateCountryPostal('90210', 'US')

        // ASSERT
        expect(frenchValid.isValid).toBe(true)
        expect(frenchInvalid.isValid).toBe(false)
        expect(usValid.isValid).toBe(true)
      })
    })

    describe('addressValidation.suggestCorrections', () => {
      it('devrait suggérer corrections pour erreurs communes', () => {
        // ARRANGE - Adresse avec erreurs typiques
        const addressWithErrors = {
          first_name: '',
          last_name: 'dupont', // Pas de majuscule
          address_line_1: '123 rue république', // Manque "de la"
          city: 'paris', // Pas de majuscule
          postal_code: '7500', // Manque chiffre
          country: 'france' // Devrait être FR
        }

        // ACT
        const suggestions = addressValidation.suggestCorrections(addressWithErrors)

        // ASSERT - Suggestions de corrections
        expect(suggestions).toEqual({
          first_name: 'Prénom requis',
          last_name: 'Dupont', // Correction casse
          address_line_1: '123 Rue de la République', // Correction format
          city: 'Paris', // Correction casse
          postal_code: '75001', // Suggestion code postal valide
          country: 'FR' // Correction format pays
        })
      })
    })
  })

  describe('🔴 Integration Forms (Tests composants)', () => {
    describe('Real-time validation', () => {
      it('devrait valider champ par champ en temps réel', () => {
        // ARRANGE - Simule saisie utilisateur progressive
        const fields = {
          first_name: 'jean',
          last_name: '',
          address_line_1: '123',
          city: '',
          postal_code: '',
          country: 'FR'
        }

        // ACT - Validation field-by-field
        const validations = Object.entries(fields).map(([field, value]) => ({
          field,
          validation: addressValidation.validateField(field, value, fields)
        }))

        // ASSERT - Résultats validation temps réel
        const firstNameValidation = validations.find(v => v.field === 'first_name')
        const lastNameValidation = validations.find(v => v.field === 'last_name')
        
        expect(firstNameValidation?.validation.isValid).toBe(true)
        expect(lastNameValidation?.validation.isValid).toBe(false)
        expect(lastNameValidation?.validation.error).toContain('requis')
      })
    })

    describe('Form state management', () => {
      it('devrait gérer états de validation formulaire', () => {
        // ARRANGE - État formulaire en cours de saisie
        const formState = {
          fields: {
            first_name: 'Jean',
            last_name: 'Dupont',
            address_line_1: '123 Rue Test',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          },
          touched: {
            first_name: true,
            last_name: true,
            address_line_1: false, // Pas encore touché
            city: true,
            postal_code: false,
            country: true
          }
        }

        // ACT
        const validation = addressValidation.validateForm(formState)

        // ASSERT
        expect(validation.isValid).toBe(false) // Champs non touchés
        expect(validation.touchedErrors).toHaveLength(0) // Pas d'erreur sur champs touchés
        expect(validation.canSubmit).toBe(false) // Formulaire incomplet
      })
    })
  })
})