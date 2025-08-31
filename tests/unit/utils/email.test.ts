/**
 * Tests unitaires pour utils/email
 * Tests envoi d'emails avec nodemailer
 */

import { sendEmail } from '@/utils/email'
import nodemailer from 'nodemailer'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}))

const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}

const mockCreateTransporter = nodemailer.createTransporter as jest.MockedFunction<typeof nodemailer.createTransporter>
mockCreateTransporter.mockReturnValue(mockTransporter as any)

describe('utils/email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock environment variables
    process.env.EMAIL_SERVER_HOST = 'smtp.test.com'
    process.env.EMAIL_SERVER_PORT = '587'
    process.env.EMAIL_SERVER_USER = 'test@herbisveritas.fr'
    process.env.EMAIL_SERVER_PASSWORD = 'test-password'
    process.env.EMAIL_FROM = 'noreply@herbisveritas.fr'
  })

  describe('sendEmail', () => {
    it('should send email with correct payload', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      }

      const result = await sendEmail(emailData)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@herbisveritas.fr',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      })

      expect(result).toEqual({ messageId: 'test-message-id' })
    })

    it('should handle email sending errors', async () => {
      const emailData = {
        to: 'invalid-email',
        subject: 'Test',
        html: '<p>Test</p>'
      }

      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Invalid email'))

      await expect(sendEmail(emailData)).rejects.toThrow('Invalid email')
    })

    it('should use environment variables for SMTP config', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Config Test',
        html: '<p>Config test</p>'
      }

      await sendEmail(emailData)

      expect(mockCreateTransporter).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@herbisveritas.fr',
          pass: 'test-password'
        }
      })
    })

    it('should use default port if not specified', async () => {
      delete process.env.EMAIL_SERVER_PORT

      const emailData = {
        to: 'test@example.com',
        subject: 'Port Test',
        html: '<p>Port test</p>'
      }

      await sendEmail(emailData)

      expect(mockCreateTransporter).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 2525, // default port
        secure: false,
        auth: {
          user: 'test@herbisveritas.fr',
          pass: 'test-password'
        }
      })
    })
  })
})