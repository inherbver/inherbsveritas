/**
 * Composant Text - HerbisVeritas Typography
 */
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

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

export { Text, textVariants, type TextProps }