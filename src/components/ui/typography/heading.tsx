/**
 * Composant Heading - HerbisVeritas Typography
 */
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

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

export { Heading, headingVariants, type HeadingProps }