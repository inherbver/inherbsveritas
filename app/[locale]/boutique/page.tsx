import { redirect } from 'next/navigation'

export default function BoutiquePage() {
  redirect('/products')
}

export const metadata = {
  title: 'Boutique | HerbisVeritas - Cosmétiques Bio Artisanaux',
  description: 'Découvrez nos cosmétiques bio artisanaux aux 7 labels HerbisVeritas.'
}