import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n-config'
import { notFound } from 'next/navigation'
import { ModernLayoutWrapper } from '@/components/layout/modern-layout'
import { Toaster } from 'sonner'
import ErrorBoundary from '@/components/error-boundary'
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
            <ErrorBoundary>
              <ModernLayoutWrapper locale={locale}>
                {children}
              </ModernLayoutWrapper>
            </ErrorBoundary>
            <Toaster 
              position="bottom-right" 
              richColors 
              closeButton 
              expand 
              visibleToasts={4}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}