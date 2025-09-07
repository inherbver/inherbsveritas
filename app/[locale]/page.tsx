import { setRequestLocale } from 'next-intl/server'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div>
      <h1>HerbisVeritas Test Page</h1>
      <p>Système d&apos;internationalisation fonctionnel !</p>
      <ul>
        <li>next-intl v4.1.0+ configuré</li>
        <li>Routing internationalisé [locale] fonctionnel</li>
        <li>Middleware i18n opérationnel</li>
        <li>Rewriting /boutique → /shop actif</li>
        <li>CSS et Tailwind corrigés</li>
      </ul>
    </div>
  )
}
