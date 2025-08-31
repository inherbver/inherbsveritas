import { locales } from '@/i18n-config'
import { notFound } from 'next/navigation'

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

  return (
    <html lang={locale}>
      <body>
        <div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}