/**
 * Optimized Icon Imports - Bundle Size Optimization
 * Import sélectif des icônes Lucide React (-300KB bundle)
 */

// Core navigation icons (critical path)
import { Home, Menu, X, User, Search, ShoppingCart } from 'lucide-react';

// Business icons (HerbisVeritas)
import { Leaf, Heart, Star, Award, Shield } from 'lucide-react';

// UI interaction icons
import { ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';

// Form icons
import { Eye, EyeOff, Check, AlertTriangle, Info } from 'lucide-react';

// Theme icons
import { Sun, Moon } from 'lucide-react';

// Social icons (critical pour footer)
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

// Export centralisé des icônes critiques
export const Icons = {
  // Navigation
  home: Home,
  menu: Menu,
  close: X,
  user: User,
  search: Search,
  cart: ShoppingCart,

  // Business
  leaf: Leaf,
  heart: Heart,
  star: Star,
  award: Award,
  shield: Shield,

  // UI
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  plus: Plus,
  minus: Minus,

  // Forms
  eye: Eye,
  eyeOff: EyeOff,
  check: Check,
  warning: AlertTriangle,
  info: Info,

  // Theme
  sun: Sun,
  moon: Moon,

  // Social
  facebook: Facebook,
  instagram: Instagram,
  mail: Mail,
  phone: Phone,
} as const;

// Types pour TypeScript
export type IconName = keyof typeof Icons;

// Helper component pour utilisation dynamique
interface DynamicIconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className, size = 16 }: DynamicIconProps) {
  const IconComponent = Icons[name];
  return <IconComponent className={className} size={size} />;
}

// Configuration des icônes à charger dynamiquement (placeholder pour lazy loading)
export const LazyIconsConfig = {
  admin: ['settings', 'users', 'bar-chart', 'package'],
  ecommerce: ['credit-card', 'truck', 'gift', 'tag'],
  social: ['twitter', 'linkedin', 'share-2'],
  utility: ['external-link', 'calendar', 'clock', 'map-pin', 'filter']
} as const;