/**
 * Footer Links Component
 * 
 * Navigation links organized by category
 */

import Link from 'next/link'

interface LinkSection {
  title: string
  links: Array<{
    label: string
    href: string
  }>
  className?: string
}

const linkSections: LinkSection[] = [
  {
    title: "About Us",
    className: "w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12",
    links: [
      { label: "Home", href: "#" },
      { label: "Features", href: "#" },
      { label: "About", href: "#" },
      { label: "Testimonial", href: "#" }
    ]
  },
  {
    title: "Features",
    className: "w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12",
    links: [
      { label: "How it works", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Refund policy", href: "#" }
    ]
  },
  {
    title: "Our Products",
    className: "w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12",
    links: [
      { label: "LineIcons", href: "#" },
      { label: "Next.js Templates", href: "#" },
      { label: "TailAdmin", href: "#" },
      { label: "PlainAdmin", href: "#" }
    ]
  },
  {
    title: "Useful Links",
    className: "w-full px-4 md:w-2/3 lg:w-6/12 xl:w-3/12",
    links: [
      { label: "FAQ", href: "#" },
      { label: "Blogs", href: "#" },
      { label: "Support", href: "#" },
      { label: "About", href: "#" }
    ]
  }
]

export function FooterLinks() {
  return (
    <>
      {linkSections.map((section) => (
        <section key={section.title} className={section.className}>
          <div className="mb-10 w-full">
            <h4 className="mb-9 text-lg font-semibold text-white">
              {section.title}
            </h4>
            <nav>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="mb-3 inline-block text-base text-gray-7 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      ))}
    </>
  )
}