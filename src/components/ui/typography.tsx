/**
 * Composants typographiques HerbisVeritas
 * Basés sur le guide typographique avec hiérarchie Playfair Display + Montserrat
 */
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

// === HEADINGS ===
const headingVariants = cva(
  'font-display leading-tight tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-4xl font-bold',          // 40px mobile → 64px desktop
        h2: 'text-2xl font-semibold',      // 28px mobile → 40px desktop  
        h3: 'text-xl font-medium',         // 22px mobile → 28px desktop
        h4: 'text-lg font-medium',         // 18px mobile → 22px desktop
        h5: 'text-base font-semibold',     // 16px mobile → 18px desktop
        h6: 'text-xs font-bold',           // 14px mobile → 16px desktop
      },
      variant: {
        default: 'text-foreground',
        primary: 'text-hv-primary',
        secondary: 'text-hv-secondary',
        accent: 'text-hv-accent',
        muted: 'text-muted-foreground',
      }
    },
    defaultVariants: {
      level: 'h1',
      variant: 'default'
    }
  }
)

interface HeadingProps 
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, variant, as, ...props }, ref) => {
    const Comp = as || level || 'h1'
    return (
      <Comp
        className={cn(headingVariants({ level: level || as, variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

// === PARAGRAPHS ===
const textVariants = cva(
  'font-sans leading-relaxed',
  {
    variants: {
      size: {
        xs: 'text-xs',      // 12-14px - légendes, captions
        sm: 'text-sm',      // 14-15px - petits paragraphes  
        base: 'text-base',  // 16-18px - paragraphe standard
        lg: 'text-lg',      // 18-22px - texte important
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-hv-primary',
        secondary: 'text-hv-secondary',
        accent: 'text-hv-accent',
      },
      weight: {
        regular: 'font-regular',
        medium: 'font-medium', 
        semibold: 'font-semibold',
        bold: 'font-bold',
      }
    },
    defaultVariants: {
      size: 'base',
      variant: 'default',
      weight: 'regular'
    }
  }
)

interface TextProps 
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, variant, weight, as = 'p', ...props }, ref) => {
    const Comp = as as React.ElementType
    return (
      <Comp
        className={cn(textVariants({ size, variant, weight }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = 'Text'

// === CITATION ===
const quoteVariants = cva(
  'font-display italic leading-normal border-l-4 border-hv-primary/20 pl-6 py-4',
  {
    variants: {
      size: {
        base: 'text-lg',    // 18-22px - citation standard
        large: 'text-xl',   // 22-28px - citation importante
      },
      variant: {
        default: 'text-foreground',
        primary: 'text-hv-primary-700',
        secondary: 'text-hv-secondary-700',
      }
    },
    defaultVariants: {
      size: 'base',
      variant: 'default'
    }
  }
)

interface QuoteProps 
  extends React.HTMLAttributes<HTMLQuoteElement>,
    VariantProps<typeof quoteVariants> {}

const Quote = React.forwardRef<HTMLQuoteElement, QuoteProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <blockquote
        className={cn(quoteVariants({ size, variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Quote.displayName = 'Quote'

// === SLOGAN / PUNCHLINE ===
const sloganVariants = cva(
  'font-display font-bold italic leading-tight tracking-wide',
  {
    variants: {
      size: {
        base: 'text-xl',    // 22-28px
        large: 'text-2xl',  // 28-36px  
        hero: 'text-3xl',   // 36-48px
      },
      variant: {
        default: 'text-foreground',
        primary: 'text-hv-primary',
        accent: 'text-hv-accent',
        gradient: 'bg-gradient-to-r from-hv-primary via-hv-secondary to-hv-accent bg-clip-text text-transparent',
      }
    },
    defaultVariants: {
      size: 'base',
      variant: 'primary'
    }
  }
)

interface SloganProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sloganVariants> {
  as?: keyof JSX.IntrinsicElements
}

const Slogan = React.forwardRef<HTMLDivElement, SloganProps>(
  ({ className, size, variant, as = 'div', ...props }, ref) => {
    const Comp = as as React.ElementType
    return (
      <Comp
        className={cn(sloganVariants({ size, variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Slogan.displayName = 'Slogan'

// === LABELS / TAGS ===
const labelVariants = cva(
  'font-sans font-bold uppercase tracking-wide',
  {
    variants: {
      size: {
        xs: 'text-xs px-2 py-1',      // 12-14px - petits tags
        sm: 'text-sm px-3 py-1.5',   // 14-15px - labels standards
      },
      variant: {
        default: 'bg-hv-neutral-100 text-hv-neutral-700',
        primary: 'bg-hv-primary-100 text-hv-primary-700',
        secondary: 'bg-hv-secondary-100 text-hv-secondary-700', 
        accent: 'bg-hv-accent-100 text-hv-accent-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        full: 'rounded-full',
      }
    },
    defaultVariants: {
      size: 'sm',
      variant: 'default',
      rounded: 'md'
    }
  }
)

interface LabelProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  ({ className, size, variant, rounded, ...props }, ref) => {
    return (
      <span
        className={cn(labelVariants({ size, variant, rounded }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'

// === LIENS ===
const linkVariants = cva(
  'font-sans font-medium transition-colors duration-200 hover:underline',
  {
    variants: {
      variant: {
        default: 'text-hv-primary hover:text-hv-primary-700',
        secondary: 'text-hv-secondary hover:text-hv-secondary-700',
        accent: 'text-hv-accent hover:text-hv-accent-700',
        muted: 'text-muted-foreground hover:text-foreground',
        inherit: 'text-inherit hover:text-hv-primary',
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface LinkProps 
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <a
        className={cn(linkVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Link.displayName = 'Link'

export { 
  Heading, 
  Text, 
  Quote, 
  Slogan, 
  Label, 
  Link,
  headingVariants,
  textVariants,
  quoteVariants,
  sloganVariants,
  labelVariants,
  linkVariants
}