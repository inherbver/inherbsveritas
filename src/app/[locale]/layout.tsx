/**
 * Internationalized Layout for HerbisVeritas V2
 * Handles locale-specific routing and translations
 */
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n-config'
import Footer from '@/components/footer'
import Header from '@/components/header'
import ScrollToTop from '@/components/scroll-to-top'
import '../../styles/index.css'
import '../../styles/prism-vsc-dark-plus.css'
import Providers from '../providers'

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
            <div className="isolate">
              <Header />
              {children}
              <Footer />
              <ScrollToTop />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}