/**
 * Tests TDD pour le service d'addresses HerbisVeritas  
 * Red → Green → Refactor selon CLAUDE.md
 */

import { addressService } from '@/lib/addresses/address-service'
import type { User } from '@supabase/supabase-js'

// Mock données de test déterministes (selon CLAUDE.md)
const mockUser: User = {
  id: 'user-123',
  email: 'test@herbisveritas.fr', 
  user_metadata: { role: 'user' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z'
}

const mockAddress = {
  id: 'addr-123',
  user_id: 'user-123',
  type: 'shipping' as const,
  is_default: true,
  first_name: 'Jean',
  last_name: 'Dupont', 
  company: null,
  address_line_1: '123 Rue de la Paix',
  address_line_2: null,
  city: 'Paris',
  postal_code: '75001',
  country: 'FR',
  phone: '+33123456789',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z'
}

const mockBillingAddress = {
  ...mockAddress,
  id: 'addr-456',
  type: 'billing' as const,
  is_default: false
}

describe('AddressService - TDD Red Phase', () => {
  let mockSupabase: ReturnType<typeof global.createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = global.createMockSupabaseClient()
    jest.clearAllMocks()
  })

  describe('🔴 CRUD Operations (Tests écrits AVANT API)', () => {
    describe('createAddress', () => {
      it('devrait créer une adresse avec données valides', async () => {
        // ARRANGE
        const addressData = {
          type: 'shipping' as const,
          first_name: 'Jean',
          last_name: 'Dupont',
          address_line_1: '123 Rue de la Paix',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR',
          phone: '+33123456789'
        }

        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockAddress],
              error: null
            })
          })
        })

        // ACT - Va échouer en Red phase
        const result = await addressService.createAddress(mockUser.id, addressData)

        // ASSERT - Contrat observable attendu
        expect(result.success).toBe(true)
        expect(result.address).toEqual(mockAddress)
        expect(result.error).toBeNull()
        expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      })

      it('devrait définir première adresse comme défaut automatiquement', async () => {
        // ARRANGE - Aucune adresse existante
        mockSupabase.from.mockImplementation((table) => {
          if (table === 'addresses') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({
                    data: [], // Pas d'adresse existante
                    error: null
                  })
                })
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                  data: [{ ...mockAddress, is_default: true }],
                  error: null
                })
              })
            }
          }
          return mockSupabase.from(table)
        })

        const addressData = {
          type: 'shipping' as const,
          first_name: 'Marie',
          last_name: 'Martin',
          address_line_1: '456 Avenue des Champs',
          city: 'Lyon',
          postal_code: '69000',
          country: 'FR'
        }

        // ACT
        const result = await addressService.createAddress(mockUser.id, addressData)

        // ASSERT - Première adresse doit être défaut
        expect(result.success).toBe(true)
        expect(result.address?.is_default).toBe(true)
      })

      it('devrait valider code postal français', async () => {
        // ARRANGE - Code postal invalide
        const invalidPostalData = {
          type: 'billing' as const,
          first_name: 'Test',
          last_name: 'User',
          address_line_1: '123 Rue Test',
          city: 'Paris',
          postal_code: '7500', // Invalid - trop court
          country: 'FR'
        }

        // ACT
        const result = await addressService.createAddress(mockUser.id, invalidPostalData)

        // ASSERT - Validation côté client
        expect(result.success).toBe(false)
        expect(result.error).toContain('code postal')
        expect(mockSupabase.from).not.toHaveBeenCalled()
      })
    })

    describe('getUserAddresses', () => {
      it('devrait récupérer toutes les adresses utilisateur', async () => {
        // ARRANGE
        const mockAddresses = [mockAddress, mockBillingAddress]
        
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockAddresses,
                error: null
              })
            })
          })
        })

        // ACT
        const addresses = await addressService.getUserAddresses(mockUser.id)

        // ASSERT
        expect(addresses).toEqual(mockAddresses)
        expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      })

      it('devrait retourner tableau vide si pas d\'adresses', async () => {
        // ARRANGE
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })

        // ACT
        const addresses = await addressService.getUserAddresses(mockUser.id)

        // ASSERT
        expect(addresses).toEqual([])
      })
    })

    describe('updateAddress', () => {
      it('devrait mettre à jour une adresse existante', async () => {
        // ARRANGE
        const updates = {
          city: 'Marseille',
          postal_code: '13000'
        }

        const updatedAddress = { ...mockAddress, ...updates }

        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                  data: [updatedAddress],
                  error: null
                })
              })
            })
          })
        })

        // ACT
        const result = await addressService.updateAddress(mockUser.id, mockAddress.id, updates)

        // ASSERT
        expect(result.success).toBe(true)
        expect(result.address).toEqual(updatedAddress)
        expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      })

      it('devrait empêcher modification adresse d\'autre utilisateur', async () => {
        // ARRANGE - Tentative modification adresse autre user
        const otherUserId = 'other-user-456'
        
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                  data: [], // Aucune adresse trouvée (sécurité RLS)
                  error: null
                })
              })
            })
          })
        })

        // ACT
        const result = await addressService.updateAddress(
          otherUserId, 
          mockAddress.id, 
          { city: 'Hacked' }
        )

        // ASSERT
        expect(result.success).toBe(false)
        expect(result.error).toContain('non trouvée')
      })
    })

    describe('deleteAddress', () => {
      it('devrait supprimer une adresse', async () => {
        // ARRANGE
        mockSupabase.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        })

        // ACT
        const result = await addressService.deleteAddress(mockUser.id, mockAddress.id)

        // ASSERT
        expect(result.success).toBe(true)
        expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      })

      it('devrait gérer suppression adresse par défaut', async () => {
        // ARRANGE - Supprime adresse par défaut, doit promouvoir une autre
        mockSupabase.from.mockImplementation((table) => {
          if (table === 'addresses') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    neq: jest.fn().mockReturnValue({
                      limit: jest.fn().mockResolvedValue({
                        data: [mockBillingAddress], // Une autre adresse existe
                        error: null
                      })
                    })
                  })
                })
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ error: null })
                })
              }),
              delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ error: null })
                })
              })
            }
          }
          return mockSupabase.from(table)
        })

        // ACT - Supprime l'adresse par défaut
        const result = await addressService.deleteAddress(mockUser.id, mockAddress.id)

        // ASSERT - Doit promouvoir une autre adresse comme défaut
        expect(result.success).toBe(true)
        expect(result.promotedNewDefault).toBe(true)
      })
    })

    describe('setDefaultAddress', () => {
      it('devrait définir une adresse comme défaut', async () => {
        // ARRANGE
        mockSupabase.from.mockImplementation(() => ({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null })
            })
          })
        }))

        // ACT
        const result = await addressService.setDefaultAddress(
          mockUser.id, 
          mockBillingAddress.id, 
          'billing'
        )

        // ASSERT
        expect(result.success).toBe(true)
        // Doit désactiver les autres adresses du même type puis activer la nouvelle
        expect(mockSupabase.from).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('🔴 Address Types & Business Rules (Tests métier)', () => {
    describe('getDefaultAddress', () => {
      it('devrait récupérer adresse par défaut par type', async () => {
        // ARRANGE
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockAddress,
                    error: null
                  })
                })
              })
            })
          })
        })

        // ACT
        const address = await addressService.getDefaultAddress(mockUser.id, 'shipping')

        // ASSERT
        expect(address).toEqual(mockAddress)
        expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      })

      it('devrait retourner null si pas d\'adresse par défaut', async () => {
        // ARRANGE
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                  })
                })
              })
            })
          })
        })

        // ACT
        const address = await addressService.getDefaultAddress(mockUser.id, 'billing')

        // ASSERT
        expect(address).toBeNull()
      })
    })

    describe('validateAddress', () => {
      it('devrait valider adresse française complète', () => {
        // ARRANGE
        const validFrenchAddress = {
          first_name: 'Jean',
          last_name: 'Dupont',
          address_line_1: '123 Rue de la République',
          city: 'Lyon',
          postal_code: '69000',
          country: 'FR'
        }

        // ACT
        const validation = addressService.validateAddress(validFrenchAddress)

        // ASSERT
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toEqual([])
      })

      it('devrait rejeter adresse incomplète', () => {
        // ARRANGE
        const incompleteAddress = {
          first_name: 'Jean',
          // last_name manquant
          address_line_1: '123 Rue Test',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR'
        }

        // ACT
        const validation = addressService.validateAddress(incompleteAddress as any)

        // ASSERT
        expect(validation.isValid).toBe(false)
        expect(validation.errors).toContain('Nom requis')
      })

      it('devrait valider formats code postal par pays', () => {
        // ARRANGE - Différents pays et codes postaux
        const testCases = [
          { country: 'FR', postal_code: '75001', valid: true },
          { country: 'FR', postal_code: '7500', valid: false }, // Trop court
          { country: 'US', postal_code: '90210', valid: true },
          { country: 'US', postal_code: '90210-1234', valid: true }, // ZIP+4
          { country: 'CA', postal_code: 'H3B 1X9', valid: true },
          { country: 'CA', postal_code: 'H3B1X9', valid: true }, // Sans espace
        ]

        testCases.forEach(({ country, postal_code, valid }) => {
          const address = {
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test St',
            city: 'Test City',
            postal_code,
            country
          }

          // ACT
          const validation = addressService.validateAddress(address)

          // ASSERT
          expect(validation.isValid).toBe(valid)
          if (!valid) {
            expect(validation.errors.some(error => 
              error.includes('code postal')
            )).toBe(true)
          }
        })
      })
    })
  })

  describe('🔴 Database Integration (Tests RLS)', () => {
    it('devrait respecter RLS - utilisateur ne voit que ses adresses', async () => {
      // ARRANGE - Mock RLS Supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockAddress], // RLS filtre automatiquement
            error: null
          })
        })
      })

      // ACT
      const addresses = await addressService.getUserAddresses(mockUser.id)

      // ASSERT - RLS garantit que seules les adresses user sont retournées
      expect(addresses).toHaveLength(1)
      expect(addresses[0].user_id).toBe(mockUser.id)
    })
  })
})