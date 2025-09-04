import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Utilise les tokens shadcn/ui (primary = vert olivier via CSS variables)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // HerbisVeritas variants spécifiques
        "hv-primary": "bg-hv-primary text-white hover:bg-hv-primary-600 shadow-sm",
        "hv-secondary": "bg-hv-secondary text-white hover:bg-hv-secondary-600 shadow-sm",
        "hv-accent": "bg-hv-accent text-white hover:bg-hv-accent-600 shadow-sm",
        
        // Outline variants HerbisVeritas
        "hv-primary-outline": "border-2 border-hv-primary text-hv-primary bg-transparent hover:bg-hv-primary hover:text-white",
        "hv-secondary-outline": "border-2 border-hv-secondary text-hv-secondary bg-transparent hover:bg-hv-secondary hover:text-white",
        "hv-accent-outline": "border-2 border-hv-accent text-hv-accent bg-transparent hover:bg-hv-accent hover:text-white",
        
        // Ghost variants HerbisVeritas
        "hv-primary-ghost": "text-hv-primary hover:bg-hv-primary-50 hover:text-hv-primary-700",
        "hv-secondary-ghost": "text-hv-secondary hover:bg-hv-secondary-50 hover:text-hv-secondary-700",
        "hv-accent-ghost": "text-hv-accent hover:bg-hv-accent-50 hover:text-hv-accent-700",
        
        // Semantic variants
        "hv-success": "bg-hv-success text-white hover:bg-hv-success/90",
        "hv-warning": "bg-hv-warning text-hv-neutral-900 hover:bg-hv-warning/90", 
        "hv-error": "bg-hv-error text-white hover:bg-hv-error/90",
        "hv-info": "bg-hv-info text-white hover:bg-hv-info/90",
        
        // Standard variants (compatibilité shadcn/ui)
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }