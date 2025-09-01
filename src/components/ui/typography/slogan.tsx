/**
 * Composant Slogan - HerbisVeritas Typography
 */
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

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

export { Slogan, sloganVariants, type SloganProps }