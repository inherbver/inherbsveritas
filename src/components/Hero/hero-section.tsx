/**
 * Hero Section Component
 * 
 * Main hero section container with background and responsive layout
 */

import { ReactNode } from 'react';

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
}

export function HeroSection({ children, className = '' }: HeroSectionProps) {
  return (
    <section
      id="home"
      className={`relative overflow-hidden bg-primary pt-[120px] md:pt-[130px] lg:pt-[160px] ${className}`}
    >
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          {children}
        </div>
      </div>
    </section>
  );
}