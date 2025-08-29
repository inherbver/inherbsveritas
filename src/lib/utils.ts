/**
 * HerbisVeritas Utility Functions
 * Common helper functions used throughout the application
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSS class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price for display
export function formatPrice(
  price: number | string,
  options: Intl.NumberFormatOptions & {
    locale?: string
  } = {}
): string {
  const { locale = 'fr-FR', ...formatOptions } = options
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    ...formatOptions,
  }).format(Number(price))
}

// Format date for display
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions & {
    locale?: string
  } = {}
): string {
  const { locale = 'fr-FR', ...formatOptions } = options
  
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...formatOptions,
  }).format(new Date(date))
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Check if email is valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if phone number is valid (French format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return `+33 ${cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`
  }
  
  return phone
}

// Calculate reading time (words per minute)
export function calculateReadingTime(text: string, wpm = 200): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wpm)
}

// Deep merge objects
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = result[key]
      
      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }
  
  return result
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Get image URL with fallback
export function getImageUrl(url?: string | null, fallback = '/images/placeholder.jpg'): string {
  if (!url) return fallback
  
  // If URL is already absolute, return as is
  if (url.startsWith('http') || url.startsWith('//')) {
    return url
  }
  
  // If URL starts with /, it's already an absolute path
  if (url.startsWith('/')) {
    return url
  }
  
  // Otherwise, assume it's a relative path and make it absolute
  return `/${url}`
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// Format file size
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Get initials from name
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || ''
  const last = lastName?.charAt(0).toUpperCase() || ''
  return `${first}${last}` || '?'
}