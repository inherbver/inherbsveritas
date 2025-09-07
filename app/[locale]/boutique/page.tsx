import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

interface BoutiquePageProps {
  params: Promise<{ locale: string }>
}

export default async function BoutiquePage({ params }: BoutiquePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  redirect('/products')
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Boutique | HerbisVeritas - Cosmétiques Bio Artisanaux',
  description: 'Découvrez nos cosmétiques bio artisanaux aux 7 labels HerbisVeritas.'
}