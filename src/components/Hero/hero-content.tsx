/**
 * Hero Content Component
 * 
 * Main content section of hero with title, description and CTA buttons
 */

import Link from "next/link";

interface HeroContentProps {
  title: string;
  description: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
}

export function HeroContent({ title, description, primaryCta, secondaryCta }: HeroContentProps) {
  return (
    <div className="w-full px-4">
      <div
        className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
        data-wow-delay=".2s"
      >
        <h1 
          id="hero-title"
          className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]"
        >
          {title}
        </h1>
        <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
          {description}
        </p>
        <div className="mb-10 flex flex-wrap items-center justify-center gap-5" role="group" aria-label="Actions principales">
          <Link
            href={primaryCta.href}
            className="inline-flex items-center justify-center rounded-md bg-white px-7 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2"
            aria-describedby="hero-title"
          >
            {primaryCta.text}
          </Link>
          <Link
            href={secondaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-md bg-white/[0.12] px-6 py-[14px] text-base font-medium text-white transition duration-300 ease-in-out hover:bg-white hover:text-dark"
            aria-label={`${secondaryCta.text} (ouvre dans un nouvel onglet)`}
          >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_2005_10818)">
                  <path
                    d="M12.0004 2.39814C6.69531 2.39814 2.40039 6.69306 2.40039 11.9981C2.40039 16.3231 5.02564 20.0256 8.70914 21.2869C9.20914 21.3775 9.39977 21.0931 9.39977 20.8481C9.39977 20.6294 9.38727 19.9006 9.38102 18.9294C6.52664 19.5294 5.93914 17.5219 5.93914 17.5219C5.48289 16.4031 4.82102 16.1206 4.82102 16.1206C3.89977 15.5031 4.89352 15.5169 4.89352 15.5169C5.91852 15.5919 6.44352 16.5244 6.44352 16.5244C7.34914 18.0481 8.81289 17.6006 9.42352 17.3669C9.51289 16.7131 9.76977 16.2675 10.0504 16.0419C7.67914 15.8144 5.18414 14.9594 5.18414 10.9694C5.18414 9.90688 5.58102 9.03813 6.46352 8.36188C6.36102 8.13313 6.02664 7.12938 6.56102 5.76688C6.56102 5.76688 7.41789 5.51688 9.37039 6.85188C10.1754 6.65313 11.0929 6.55375 12.0004 6.55C12.9079 6.55375 13.8254 6.65313 14.6304 6.85188C16.5829 5.51688 17.4379 5.76688 17.4379 5.76688C17.9754 7.12938 17.6404 8.13313 17.5379 8.36188C18.4229 9.03813 18.8154 9.90688 18.8154 10.9694C18.8154 14.9694 16.3154 15.8119 13.9379 16.0356C14.2954 16.3431 14.6154 16.9506 14.6154 17.8775C14.6154 19.2225 14.6029 20.3094 14.6029 20.8481C14.6029 21.0956 14.7904 21.3831 15.2979 21.2856C18.9779 20.0206 21.6004 16.3206 21.6004 11.9981C21.6004 6.69306 17.3054 2.39814 12.0004 2.39814Z"
                    fill=""
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2005_10818">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0 0.000976562)"
                    />
                  </clipPath>
                </defs>
              </svg>
              {secondaryCta.text}
            </Link>
        </div>
      </div>
    </div>
  );
}