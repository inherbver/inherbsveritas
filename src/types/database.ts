/**
 * HerbisVeritas V2 - MVP Database Types
 * Based on the 13-table MVP schema documentation
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// MVP Enums (simplified for launch)

// User roles enum (MVP: 3 roles only)
export type UserRole = 'user' | 'admin' | 'dev'

// Order status enum (MVP: 4 states only)
export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered'

// Payment status enum
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

// Address type enum
export type AddressType = 'shipping' | 'billing'

// Article status enum
export type ArticleStatus = 'draft' | 'published' | 'archived'

// Product labels for HerbisVeritas (MVP: 7 specific labels)
export type ProductLabel = 
  | 'recolte_main'           // "Récolté à la main"
  | 'bio'                    // "Bio"
  | 'origine_occitanie'      // "Origine Occitanie" 
  | 'partenariat_producteurs' // "Partenariat producteurs locaux"
  | 'rituel_bien_etre'       // "Rituel de bien-être"
  | 'rupture_recolte'        // "Rupture de récolte"
  | 'essence_precieuse'      // "Essence précieuse"

// Featured item types (Hero polyvalent)
export type FeaturedType = 'product' | 'article' | 'event'

// Translation interfaces for i18n JSONB
export interface TranslationContent {
  [locale: string]: {
    name?: string
    title?: string
    description?: string
    excerpt?: string
    content?: string
    [key: string]: any
  }
}

// MVP Database Schema (13 tables)
export interface Database {
  public: {
    Tables: {
      // 1. Users (3 roles MVP)
      users: {
        Row: {
          id: string // UUID references auth.users(id)
          email: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          role: UserRole
          status: string // 'active' | 'inactive'
          newsletter_subscribed: boolean
          terms_accepted_at: string | null
          last_activity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: UserRole
          status?: string
          newsletter_subscribed?: boolean
          terms_accepted_at?: string | null
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: UserRole
          status?: string
          newsletter_subscribed?: boolean
          terms_accepted_at?: string | null
          last_activity?: string | null
          updated_at?: string
        }
      }

      // 2. Addresses (FK moderne)
      addresses: {
        Row: {
          id: string
          user_id: string
          address_type: AddressType
          is_default: boolean
          first_name: string | null
          last_name: string | null
          company_name: string | null
          street_number: string | null
          address_line1: string
          address_line2: string | null
          city: string
          postal_code: string
          country_code: string
          state_province_region: string | null
          phone_number: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address_type: AddressType
          is_default?: boolean
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          street_number?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          postal_code: string
          country_code?: string
          state_province_region?: string | null
          phone_number?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          address_type?: AddressType
          is_default?: boolean
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          street_number?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          postal_code?: string
          country_code?: string
          state_province_region?: string | null
          phone_number?: string | null
          email?: string | null
          updated_at?: string
        }
      }

      // 3. Categories (hiérarchique avec i18n JSONB)
      categories: {
        Row: {
          id: string
          slug: string
          parent_id: string | null
          name: string // Contenu français (défaut)
          description: string | null
          color: string | null // Hex color
          translations: Json // i18n JSONB
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          parent_id?: string | null
          name: string
          description?: string | null
          color?: string | null
          translations?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          parent_id?: string | null
          name?: string
          description?: string | null
          color?: string | null
          translations?: Json
          sort_order?: number
          updated_at?: string
        }
      }

      // 4. Products (cosmétique avec labels HerbisVeritas)
      products: {
        Row: {
          id: string
          slug: string
          category_id: string | null
          name: string // Français (défaut)
          description_short: string | null
          description_long: string | null
          price: number // DECIMAL(10,2)
          currency: string
          stock: number
          unit: string
          image_url: string | null
          inci_list: string[] | null // Liste ingrédients INCI (réglementation EU)
          labels: ProductLabel[] | null // Labels HerbisVeritas
          status: string // 'active' | 'inactive'
          is_active: boolean
          is_new: boolean
          translations: Json // i18n JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          category_id?: string | null
          name: string
          description_short?: string | null
          description_long?: string | null
          price: number
          currency?: string
          stock?: number
          unit?: string
          image_url?: string | null
          inci_list?: string[] | null
          labels?: ProductLabel[] | null
          status?: string
          is_active?: boolean
          is_new?: boolean
          translations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          category_id?: string | null
          name?: string
          description_short?: string | null
          description_long?: string | null
          price?: number
          currency?: string
          stock?: number
          unit?: string
          image_url?: string | null
          inci_list?: string[] | null
          labels?: ProductLabel[] | null
          status?: string
          is_active?: boolean
          is_new?: boolean
          translations?: Json
          updated_at?: string
        }
      }

      // 5. Carts (système Guest/User MVP)
      carts: {
        Row: {
          id: string
          user_id: string | null // NULL si invité
          guest_id: string | null // Session invité
          status: string // 'active' | 'completed' | 'abandoned'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_id?: string | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          guest_id?: string | null
          status?: string
          metadata?: Json
          updated_at?: string
        }
      }

      // 6. Cart Items
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          added_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
          added_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          product_id?: string
          quantity?: number
          added_at?: string
          updated_at?: string
        }
      }

      // 7. Orders (commandes avec Stripe complet)
      orders: {
        Row: {
          id: string
          order_number: string | null // Généré automatiquement
          user_id: string
          status: OrderStatus // États MVP (4 états)
          payment_status: PaymentStatus
          total_amount: number // DECIMAL(10,2)
          currency: string
          shipping_fee: number // Prix fixe Colissimo MVP (4.90€)
          shipping_address_id: string | null
          billing_address_id: string | null
          payment_method: string | null
          payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          stripe_checkout_id: string | null
          shipping_method: string | null // 'colissimo'
          tracking_number: string | null
          tracking_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
          shipped_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string | null
          user_id: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          total_amount: number
          currency?: string
          shipping_fee?: number
          shipping_address_id?: string | null
          billing_address_id?: string | null
          payment_method?: string | null
          payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_checkout_id?: string | null
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          shipped_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          order_number?: string | null
          user_id?: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          total_amount?: number
          currency?: string
          shipping_fee?: number
          shipping_address_id?: string | null
          billing_address_id?: string | null
          payment_method?: string | null
          payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_checkout_id?: string | null
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          updated_at?: string
          shipped_at?: string | null
          delivered_at?: string | null
        }
      }

      // 8. Order Items (articles commande avec snapshot)
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_purchase: number // DECIMAL(10,2)
          product_name_at_purchase: string | null
          product_image_url_at_purchase: string | null
          product_sku_at_purchase: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_at_purchase: number
          product_name_at_purchase?: string | null
          product_image_url_at_purchase?: string | null
          product_sku_at_purchase?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
          product_name_at_purchase?: string | null
          product_image_url_at_purchase?: string | null
          product_sku_at_purchase?: string | null
          updated_at?: string
        }
      }

      // 9. Articles (magazine TipTap)
      articles: {
        Row: {
          id: string
          slug: string
          author_id: string
          category_id: string | null
          title: string // Français (défaut)
          excerpt: string | null
          content: Json // TipTap JSON
          content_html: string | null // HTML généré
          featured_image: string | null
          status: string // 'draft' | 'published' | 'archived'
          published_at: string | null
          seo_title: string | null
          seo_description: string | null
          translations: Json // i18n JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          author_id: string
          category_id?: string | null
          title: string
          excerpt?: string | null
          content: Json
          content_html?: string | null
          featured_image?: string | null
          status?: string
          published_at?: string | null
          seo_title?: string | null
          seo_description?: string | null
          translations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          author_id?: string
          category_id?: string | null
          title?: string
          excerpt?: string | null
          content?: Json
          content_html?: string | null
          featured_image?: string | null
          status?: string
          published_at?: string | null
          seo_title?: string | null
          seo_description?: string | null
          translations?: Json
          updated_at?: string
        }
      }

      // 10. Partners (points de vente avec réseaux sociaux)
      partners: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          image_url: string
          facebook_url: string | null
          instagram_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          address: string
          image_url: string
          facebook_url?: string | null
          instagram_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          address?: string
          image_url?: string
          facebook_url?: string | null
          instagram_url?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }

      // 11. Next Events (événement Hero simple)
      next_events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string // DATE "2025-02-15"
          time_start: string // TIME "09:00"
          time_end: string | null // TIME "17:00"
          location: string
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time_start: string
          time_end?: string | null
          location: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          date?: string
          time_start?: string
          time_end?: string | null
          location?: string
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }

      // 12. Newsletter Subscribers (basique)
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          is_active: boolean
          subscribed_at: string
          source: string | null // "website" | "popup" | "checkout"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
          subscribed_at?: string
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          is_active?: boolean
          subscribed_at?: string
          source?: string | null
          updated_at?: string
        }
      }

      // 13. Featured Items (Hero polyvalent)
      featured_items: {
        Row: {
          id: string
          type: FeaturedType // 'product' | 'article' | 'event'
          item_id: string // FK polymorphe
          title_override: string | null
          subtitle: string | null
          image_override: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: FeaturedType
          item_id: string
          title_override?: string | null
          subtitle?: string | null
          image_override?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: FeaturedType
          item_id?: string
          title_override?: string | null
          subtitle?: string | null
          image_override?: string | null
          is_active?: boolean
          display_order?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      order_status: OrderStatus
      payment_status: PaymentStatus
      address_type: AddressType
      article_status: ArticleStatus
      product_label: ProductLabel
      featured_type: FeaturedType
    }
  }
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Export common types for easy access
export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type Address = Tables<'addresses'>
export type AddressInsert = TablesInsert<'addresses'>
export type AddressUpdate = TablesUpdate<'addresses'>

export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>

export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

export type Cart = Tables<'carts'>
export type CartInsert = TablesInsert<'carts'>
export type CartUpdate = TablesUpdate<'carts'>

export type CartItem = Tables<'cart_items'>
export type CartItemInsert = TablesInsert<'cart_items'>
export type CartItemUpdate = TablesUpdate<'cart_items'>

export type Order = Tables<'orders'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>

export type OrderItem = Tables<'order_items'>
export type OrderItemInsert = TablesInsert<'order_items'>
export type OrderItemUpdate = TablesUpdate<'order_items'>

export type Article = Tables<'articles'>
export type ArticleInsert = TablesInsert<'articles'>
export type ArticleUpdate = TablesUpdate<'articles'>

export type Partner = Tables<'partners'>
export type PartnerInsert = TablesInsert<'partners'>
export type PartnerUpdate = TablesUpdate<'partners'>

export type NextEvent = Tables<'next_events'>
export type NextEventInsert = TablesInsert<'next_events'>
export type NextEventUpdate = TablesUpdate<'next_events'>

export type NewsletterSubscriber = Tables<'newsletter_subscribers'>
export type NewsletterSubscriberInsert = TablesInsert<'newsletter_subscribers'>
export type NewsletterSubscriberUpdate = TablesUpdate<'newsletter_subscribers'>

export type FeaturedItem = Tables<'featured_items'>
export type FeaturedItemInsert = TablesInsert<'featured_items'>
export type FeaturedItemUpdate = TablesUpdate<'featured_items'>