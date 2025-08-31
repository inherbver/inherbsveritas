/**
 * Footer Component - HerbisVeritas V2 MVP
 * 
 * Main footer component composed of modular sections
 * Refactored from 580-line monolith for maintainability
 */

import { FooterBrand } from './footer-brand'
import { FooterLinks } from './footer-links'
import { FooterBottom } from './footer-bottom'
import { DecorativeShapes } from './decorative-shapes'

const Footer = () => {
  return (
    <footer
      className="wow fadeInUp relative z-10 bg-[#090E34] pt-20 lg:pt-[100px]"
      data-wow-delay=".15s"
    >
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <FooterBrand />
          <FooterLinks />
        </div>
      </div>

      <FooterBottom />
      <DecorativeShapes />
    </footer>
  )
}

export default Footer
