/**
 * Footer Bottom Component
 * 
 * Copyright and legal links section
 */

import Link from 'next/link'

export function FooterBottom() {
  return (
    <section className="mt-12 border-t border-[#8890A4] border-opacity-40 py-8 lg:mt-[60px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <nav className="w-full px-4 md:w-2/3 lg:w-1/2">
            <div className="my-1">
              <div className="-mx-3 flex items-center justify-center md:justify-start">
                <Link
                  href="#"
                  className="px-3 text-base text-gray-7 hover:text-white hover:underline"
                >
                  Privacy policy
                </Link>
                <Link
                  href="#"
                  className="px-3 text-base text-gray-7 hover:text-white hover:underline"
                >
                  Legal notice
                </Link>
                <Link
                  href="#"
                  className="px-3 text-base text-gray-7 hover:text-white hover:underline"
                >
                  Terms of service
                </Link>
              </div>
            </div>
          </nav>
          <aside className="w-full px-4 md:w-1/3 lg:w-1/2">
            <div className="my-1 flex justify-center md:justify-end">
              <p className="text-base text-gray-7">
                Designed and Developed by{" "}
                <Link
                  href="https://tailgrids.com"
                  rel="nofollow noopner noreferrer"
                  target="_blank"
                  className="text-gray-1 hover:underline"
                >
                  TailGrids and Next.js Templates
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}