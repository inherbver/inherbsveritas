/**
 * Optimized Icon Imports - Bundle Size Optimization
 * Import sélectif des icônes Lucide React (-300KB bundle)
 */

// Core navigation icons (critical path)
import Home from 'lucide-react/dist/esm/icons/home';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import Search from 'lucide-react/dist/esm/icons/search';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';

// Business icons (HerbisVeritas)
import Leaf from 'lucide-react/dist/esm/icons/leaf';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Star from 'lucide-react/dist/esm/icons/star';
import Award from 'lucide-react/dist/esm/icons/award';
import Shield from 'lucide-react/dist/esm/icons/shield';

// UI interaction icons
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Minus from 'lucide-react/dist/esm/icons/minus';

// Form icons
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Check from 'lucide-react/dist/esm/icons/check';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Info from 'lucide-react/dist/esm/icons/info';

// Theme icons
import Sun from 'lucide-react/dist/esm/icons/sun';
import Moon from 'lucide-react/dist/esm/icons/moon';

// Social icons (critical pour footer)
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';

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

// Lazy loading pour icônes moins critiques
export const LazyIcons = {
  // Admin icons (chargés seulement si admin)
  settings: () => import('lucide-react/dist/esm/icons/settings'),
  users: () => import('lucide-react/dist/esm/icons/users'),
  barChart: () => import('lucide-react/dist/esm/icons/bar-chart'),
  package: () => import('lucide-react/dist/esm/icons/package'),

  // E-commerce icons (chargés au besoin)
  creditCard: () => import('lucide-react/dist/esm/icons/credit-card'),
  truck: () => import('lucide-react/dist/esm/icons/truck'),
  gift: () => import('lucide-react/dist/esm/icons/gift'),
  tag: () => import('lucide-react/dist/esm/icons/tag'),

  // Social extended (newsletter, partage)
  twitter: () => import('lucide-react/dist/esm/icons/twitter'),
  linkedin: () => import('lucide-react/dist/esm/icons/linkedin'),
  share: () => import('lucide-react/dist/esm/icons/share-2'),
  link: () => import('lucide-react/dist/esm/icons/external-link'),

  // Utility icons
  calendar: () => import('lucide-react/dist/esm/icons/calendar'),
  clock: () => import('lucide-react/dist/esm/icons/clock'),
  mapPin: () => import('lucide-react/dist/esm/icons/map-pin'),
  filter: () => import('lucide-react/dist/esm/icons/filter'),
} as const;

export type LazyIconName = keyof typeof LazyIcons;