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
      const payload = { userId: 'user-123', role: 'user' }
      const token = generateSessionToken(payload)
      
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should validate session token', () => {
      const token = 'mock-jwt-token'
      const decoded = validateSessionToken(token)
      
      expect(decoded).toEqual({ userId: 'user-123', role: 'user' })
    })

    it('should extract user from JWT', () => {
      const jwt = 'mock-jwt-token'
      const user = extractUserFromJWT(jwt)
      
      expect(user).toEqual({ userId: 'user-123', role: 'user' })
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
      const jwt = require('jsonwebtoken')
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })
      
      expect(() => validateSessionToken('invalid-token')).toThrow('Invalid token')
    })
  })
})