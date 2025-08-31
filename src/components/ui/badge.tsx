import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // HerbisVeritas specific variants
        bio: "border-transparent bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
        recolte: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100",
        origine: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
        partenariat: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
        rituel: "border-transparent bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100",
        rupture: "border-transparent bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
        essence: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }