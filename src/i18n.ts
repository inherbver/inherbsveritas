import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales } from './i18n-config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locale || !locales.includes(locale as any)) notFound()

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})