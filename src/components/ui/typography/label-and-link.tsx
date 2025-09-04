/**
 * Composants Label et Link - HerbisVeritas Typography
 */
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

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
        destructive: 'text-red-600 hover:text-red-700',
      },
      underline: {
        auto: '', // Default hover behavior
        always: 'underline',
        never: 'no-underline hover:no-underline',
      }
    },
    defaultVariants: {
      variant: 'default',
      underline: 'auto'
    }
  }
)

interface LinkProps 
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href?: string
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, underline, ...props }, ref) => {
    return (
      <a
        className={cn(linkVariants({ variant, underline }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Link.displayName = 'Link'

export { 
  Label, 
  labelVariants, 
  type LabelProps,
  Link,
  linkVariants,
  type LinkProps
}