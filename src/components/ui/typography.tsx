/**
 * Composants typographiques HerbisVeritas
 * Basés sur le guide typographique avec hiérarchie Playfair Display + Montserrat
 */

// Exports consolidés pour une API unifiée
export { Heading, headingVariants, type HeadingProps } from './typography/heading'
export { Text, textVariants, type TextProps } from './typography/text'
export { Slogan, sloganVariants, type SloganProps } from './typography/slogan'
export { 
  Label, 
  labelVariants, 
  type LabelProps,
  Link,
  linkVariants,
  type LinkProps
} from './typography/label-and-link'

// Composants de convenance avec presets communs
import { Heading } from './typography/heading'
import { Text } from './typography/text'
import { Slogan } from './typography/slogan'

// Export composants spécialisés pré-configurés pour usage fréquent
export const H1 = (props: React.ComponentProps<typeof Heading>) => 
  <Heading level="h1" {...props} />

export const H2 = (props: React.ComponentProps<typeof Heading>) => 
  <Heading level="h2" {...props} />

export const H3 = (props: React.ComponentProps<typeof Heading>) => 
  <Heading level="h3" {...props} />

export const H4 = (props: React.ComponentProps<typeof Heading>) => 
  <Heading level="h4" {...props} />

export const Subtitle = (props: React.ComponentProps<typeof Text>) => 
  <Text size="lg" variant="muted" {...props} />

export const Caption = (props: React.ComponentProps<typeof Text>) => 
  <Text size="sm" variant="muted" {...props} />

export const HeroSlogan = (props: React.ComponentProps<typeof Slogan>) => 
  <Slogan size="hero" variant="gradient" {...props} />

// Configuration typographique HerbisVeritas
export const typographyConfig = {
  fonts: {
    display: 'font-display', // Playfair Display pour titres
    sans: 'font-sans',       // Montserrat pour textes
  },
  scales: {
    heading: ['text-xs', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl'],
    text: ['text-xs', 'text-sm', 'text-base', 'text-lg'],
  },
  colors: {
    primary: 'text-hv-primary',
    secondary: 'text-hv-secondary', 
    accent: 'text-hv-accent',
    muted: 'text-muted-foreground',
  }
} as const