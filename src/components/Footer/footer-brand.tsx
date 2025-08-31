/**
 * Footer Brand Section Component
 * 
 * Logo, description, and social icons
 */

import Image from 'next/image'
import Link from 'next/link'
import { SocialIcons } from './social-icons'

export function FooterBrand() {
  return (
    <section className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-4/12 xl:w-3/12">
      <div className="mb-10 w-full">
        <Link href="/" className="mb-6 inline-block max-w-[160px]" aria-label="HerbisVeritas - Accueil">
          <Image
            src="/images/logo/logo-white.svg"
            alt="HerbisVeritas - Cosmétiques bio et naturels"
            width={140}
            height={30}
            className="max-w-full"
          />
        </Link>
        <p className="mb-8 max-w-[270px] text-base text-gray-7">
          We create digital experiences for brands and companies by using
          technology.
        </p>
        <SocialIcons />
      </div>
    </section>
  )
}