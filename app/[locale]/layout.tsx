import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n-config'
import { notFound } from 'next/navigation'
import { ModernLayoutWrapper } from '@/components/layout/modern-layout'
import '../../src/styles/index.css'
import '../../src/styles/prism-vsc-dark-plus.css'
import Providers from '../../src/providers'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  // Get messages for the locale
  const messages = await getMessages()

  return (
    <html suppressHydrationWarning className="!scroll-smooth" lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ModernLayoutWrapper locale={locale}>
              {children}
            </ModernLayoutWrapper>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}