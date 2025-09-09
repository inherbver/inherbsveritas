// Types business HerbisVeritas MVP
// Conforme plan MVP - 7 labels définis + categories hiérarchiques

/**
 * === 🏷️ Labels HerbisVeritas Officiels MVP ===
 * 7 labels définis selon plan MVP - business requirements
 */
export enum HerbisVeritasLabel {
  BIO = 'bio',
  NATUREL = 'naturel', 
  VEGAN = 'vegan',
  ARTISANAL = 'artisanal',
  LOCAL = 'local',
  ZERO_DECHET = 'zero_dechet',
  FAIT_MAIN = 'fait_main'
}

/**
 * Métadonnées des labels pour affichage UI
 */
export interface LabelMetadata {
  id: HerbisVeritasLabel;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  icon?: string;
  priority: number; // Ordre d'affichage
}

/**
 * Configuration complète des labels HerbisVeritas
 */
export const HERBIS_VERITAS_LABELS: Record<HerbisVeritasLabel, LabelMetadata> = {
  [HerbisVeritasLabel.BIO]: {
    id: HerbisVeritasLabel.BIO,
    name: 'Bio',
    nameEn: 'Organic',
    description: 'Certifié agriculture biologique',
    descriptionEn: 'Certified organic agriculture',
    color: '#4ade80', // hv-success
    icon: '🌿',
    priority: 1
  },
  [HerbisVeritasLabel.NATUREL]: {
    id: HerbisVeritasLabel.NATUREL,
    name: 'Naturel',
    nameEn: 'Natural',
    description: 'Ingrédients 100% naturels',
    descriptionEn: '100% natural ingredients',
    color: 'rgb(var(--primary-500))', // hv-primary
    icon: '🍃',
    priority: 2
  },
  [HerbisVeritasLabel.VEGAN]: {
    id: HerbisVeritasLabel.VEGAN,
    name: 'Vegan',
    nameEn: 'Vegan',
    description: 'Sans ingrédient d\'origine animale',
    descriptionEn: 'No animal-derived ingredients',
    color: 'rgb(var(--secondary-500))', // hv-secondary
    icon: '🌱',
    priority: 3
  },
  [HerbisVeritasLabel.ARTISANAL]: {
    id: HerbisVeritasLabel.ARTISANAL,
    name: 'Artisanal',
    nameEn: 'Artisanal',
    description: 'Produit artisanal fait main',
    descriptionEn: 'Artisanal handmade product',
    color: 'rgb(var(--accent-500))', // hv-accent
    icon: '🤲',
    priority: 4
  },
  [HerbisVeritasLabel.LOCAL]: {
    id: HerbisVeritasLabel.LOCAL,
    name: 'Local',
    nameEn: 'Local',
    description: 'Produit local français',
    descriptionEn: 'French local product',
    color: '#0ea5e9', // hv-info
    icon: '🇫🇷',
    priority: 5
  },
  [HerbisVeritasLabel.ZERO_DECHET]: {
    id: HerbisVeritasLabel.ZERO_DECHET,
    name: 'Zéro Déchet',
    nameEn: 'Zero Waste',
    description: 'Emballage zéro déchet',
    descriptionEn: 'Zero waste packaging',
    color: '#facc15', // hv-warning
    icon: '♻️',
    priority: 6
  },
  [HerbisVeritasLabel.FAIT_MAIN]: {
    id: HerbisVeritasLabel.FAIT_MAIN,
    name: 'Fait Main',
    nameEn: 'Handmade',
    description: 'Entièrement fait main',
    descriptionEn: 'Entirely handmade',
    color: 'rgb(var(--neutral-600))',
    icon: '✋',
    priority: 7
  }
};

/**
 * === 📂 Categories Hiérarchiques MVP ===
 * Structure avec i18n JSONB (FR/EN seulement MVP)
 */
export interface CategoryI18n {
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  parent_id?: string | null;
  i18n: {
    fr: CategoryI18n;
    en: CategoryI18n;
  };
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Structure hiérarchique pour navigation UI
 */
export interface CategoryTree extends Category {
  children?: CategoryTree[];
  level: number;
}

/**
 * === 🛍️ Product Types MVP ===
 * Intégration labels + INCI + i18n
 */
export interface ProductI18n {
  name: string;
  description: string;
  short_description?: string;
  ingredients?: string;
  usage_instructions?: string;
}

export interface Product {
  id: string;
  sku: string;
  category_id: string;
  i18n: {
    fr: ProductI18n;
    en: ProductI18n;
  };
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  inci_list?: string[]; // Liste INCI cosmétique
  labels: HerbisVeritasLabel[]; // Labels HerbisVeritas
  images: string[];
  featured_image?: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (pour typage)
  category?: Category;
}

/**
 * === 🛒 Cart & Store Types MVP ===
 */
export interface CartItem {
  product_id: string;
  quantity: number;
  price: number; // Prix au moment de l'ajout
  product?: Product; // Pour affichage
}

export interface Cart {
  id?: string; // Null pour guest cart
  user_id?: string | null;
  session_id?: string; // Pour guest cart
  items: CartItem[];
  subtotal: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface cart item pour Phase 2 avec données produit intégrées
 * Compatible avec user_cart_view et optimistic updates
 */
export interface HerbisCartItem {
  id: string; // ID du cart_item ou optimistic ID
  productId: string;
  name: string;
  price: number;
  quantity: number;
  labels?: HerbisVeritasLabel[];
  unit?: string;
  inci_list?: string[];
  image_url?: string;
  slug?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

/**
 * === 🎯 Business Logic Helpers ===
 */
export const getLocalizedCategory = (category: Category, locale: 'fr' | 'en' = 'fr') => {
  return category.i18n[locale];
};

export const getLocalizedProduct = (product: Product, locale: 'fr' | 'en' = 'fr') => {
  return product.i18n[locale];
};

export const getLabelMetadata = (label: HerbisVeritasLabel) => {
  return HERBIS_VERITAS_LABELS[label];
};

export const getProductLabelsMetadata = (labels: HerbisVeritasLabel[]) => {
  return labels
    .map(label => HERBIS_VERITAS_LABELS[label])
    .sort((a, b) => a.priority - b.priority);
};

/**
 * Calculer total panier avec TVA française (20%) et frais de port
 */
export const calculateCartTotal = (items: CartItem[], shippingCost: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tva = (subtotal + shippingCost) * 0.2; // TVA 20% sur total HT + port
  const total = subtotal + shippingCost + tva;
  
  return {
    subtotal,
    shippingCost,
    tva,
    total
  };
};

/**
 * Validation business rules
 */
export const validateProductStock = (product: Product, quantity: number): boolean => {
  return product.stock_quantity >= quantity && product.is_active;
};

export const isProductLowStock = (product: Product): boolean => {
  return product.stock_quantity <= product.low_stock_threshold;
};