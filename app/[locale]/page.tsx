import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  
  // Redirection automatique vers la boutique
  redirect(`/${locale}/shop`)
}
