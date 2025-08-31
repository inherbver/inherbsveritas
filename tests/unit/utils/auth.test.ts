/**
 * Tests unitaires pour utils/auth
 * Tests fonctions utilitaires auth
 */

import { 
  hashPassword, 
  verifyPassword,
  generateSessionToken,
  validateSessionToken,
  extractUserFromJWT
} from '@/utils/auth'

// Mock bcrypt et jwt si utilisés
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'user-123', role: 'user' })
}))

describe('utils/auth', () => {
  describe('password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)
      
      expect(typeof hashed).toBe('string')
      expect(hashed).not.toBe(password)
    })

    it('should verify password correctly', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = 'hashed-password'
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })
  })

  describe('session token management', () => {
    it('should generate session token', () => {
      const token = generateSessionToken()
      
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should validate session token', () => {
      const token = 'session_mock123'
      const isValid = validateSessionToken(token)
      
      expect(isValid).toBe(true)
    })

    it('should extract user from JWT', () => {
      const jwt = 'mock-jwt-token'
      const user = extractUserFromJWT(jwt)
      
      expect(user).toEqual({ id: 'user_123', email: 'test@herbisveritas.fr' })
    })
  })

  describe('edge cases', () => {
    it('should handle invalid password hash', async () => {
      const bcrypt = require('bcrypt')
      bcrypt.compare.mockResolvedValueOnce(false)
      
      const isValid = await verifyPassword('wrong-password', 'hash')
      expect(isValid).toBe(false)
    })

    it('should handle invalid JWT token', () => {
      const isValid = validateSessionToken('invalid-token')
      expect(isValid).toBe(false)
    })
  })
})