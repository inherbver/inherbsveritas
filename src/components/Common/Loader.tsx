import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
  className?: string
  text?: string
}

const Loader = ({ 
  size = "md", 
  variant = "spinner", 
  className,
  text 
}: LoaderProps = {}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("bg-primary rounded-full animate-pulse", sizeClasses[size])}></div>
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  // Spinner variant (default)
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-solid border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Page loader component
export const PageLoader = ({ text = "Chargement..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <Loader size="lg" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

// Inline loader for buttons
export const ButtonLoader = () => {
  return <Loader size="sm" className="mr-2" />
}

export default Loader;
export { Loader };
