import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales } from './i18n-config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`./i18n/messages/${locale}.json`)).default
  }
})