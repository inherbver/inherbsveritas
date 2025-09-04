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
  | 'recolte_main'           // "R�colt� � la main"
  | 'bio'                    // "Bio"
  | 'origine_occitanie'      // "Origine Occitanie" 
  | 'partenariat_producteurs' // "Partenariat producteurs locaux"
  | 'rituel_bien_etre'       // "Rituel de bien-�tre"
  | 'rupture_recolte'        // "Rupture de r�colte"
  | 'essence_precieuse'      // "Essence pr�cieuse"

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
    meta_description?: string
  }
}

// HerbisVeritas MVP Database Schema Types

export interface Database {
  public: {
    Tables: {
      // Users table (extends Supabase auth.users)
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          first_name: string | null
          last_name: string | null
          phone: string | null
          newsletter_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          newsletter_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          newsletter_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Categories table (hierarchy)
      categories: {
        Row: {
          id: string
          parent_id: string | null
          slug: string
          sort_order: number
          is_active: boolean
          translations: TranslationContent
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          is_active?: boolean
          translations: TranslationContent
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          is_active?: boolean
          translations?: TranslationContent
          created_at?: string
          updated_at?: string
        }
      }
      // Products table (inventory)
      products: {
        Row: {
          id: string
          category_id: string
          sku: string
          slug: string
          price: number
          stock_quantity: number
          low_stock_threshold: number
          weight_grams: number | null
          dimensions_cm: Json | null
          labels: ProductLabel[]
          translations: TranslationContent
          is_active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          sku: string
          slug: string
          price: number
          stock_quantity?: number
          low_stock_threshold?: number
          weight_grams?: number | null
          dimensions_cm?: Json | null
          labels?: ProductLabel[]
          translations: TranslationContent
          is_active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          sku?: string
          slug?: string
          price?: number
          stock_quantity?: number
          low_stock_threshold?: number
          weight_grams?: number | null
          dimensions_cm?: Json | null
          labels?: ProductLabel[]
          translations?: TranslationContent
          is_active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Product images table
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      // Addresses table
      addresses: {
        Row: {
          id: string
          user_id: string
          type: AddressType
          is_default: boolean
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          postal_code: string
          country: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: AddressType
          is_default?: boolean
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          postal_code: string
          country: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: AddressType
          is_default?: boolean
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          postal_code?: string
          country?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Orders table
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: OrderStatus
          email: string
          subtotal: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          currency: string
          stripe_payment_intent_id: string | null
          billing_address: Json
          shipping_address: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: OrderStatus
          email: string
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          total_amount: number
          currency?: string
          stripe_payment_intent_id?: string | null
          billing_address: Json
          shipping_address: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: OrderStatus
          email?: string
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          currency?: string
          stripe_payment_intent_id?: string | null
          billing_address?: Json
          shipping_address?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // Order items table
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      // Articles table (blog/content)
      articles: {
        Row: {
          id: string
          slug: string
          status: ArticleStatus
          published_at: string | null
          translations: TranslationContent
          featured_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          status?: ArticleStatus
          published_at?: string | null
          translations: TranslationContent
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          status?: ArticleStatus
          published_at?: string | null
          translations?: TranslationContent
          featured_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Events table 
      events: {
        Row: {
          id: string
          slug: string
          event_date: string
          location: string | null
          max_participants: number | null
          current_participants: number
          price: number | null
          translations: TranslationContent
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          event_date: string
          location?: string | null
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          translations: TranslationContent
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          event_date?: string
          location?: string | null
          max_participants?: number | null
          current_participants?: number
          price?: number | null
          translations?: TranslationContent
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Hero/Featured content table
      featured_items: {
        Row: {
          id: string
          type: FeaturedType
          target_id: string
          sort_order: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: FeaturedType
          target_id: string
          sort_order?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: FeaturedType
          target_id?: string
          sort_order?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Newsletter subscriptions
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
      // Analytics/tracking table
      page_views: {
        Row: {
          id: string
          path: string
          user_agent: string | null
          ip_address: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          path: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          path?: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Common entities
export type User = Row<'users'>
export type Category = Row<'categories'>
export type Product = Row<'products'>
export type ProductImage = Row<'product_images'>
export type Address = Row<'addresses'>
export type Order = Row<'orders'>
export type OrderItem = Row<'order_items'>
export type Article = Row<'articles'>
export type Event = Row<'events'>
export type FeaturedItem = Row<'featured_items'>
export type NewsletterSubscription = Row<'newsletter_subscriptions'>
export type PageView = Row<'page_views'>

// Insert types
export type NewUser = Insert<'users'>
export type NewCategory = Insert<'categories'>
export type NewProduct = Insert<'products'>
export type NewProductImage = Insert<'product_images'>
export type NewAddress = Insert<'addresses'>
export type NewOrder = Insert<'orders'>
export type NewOrderItem = Insert<'order_items'>
export type NewArticle = Insert<'articles'>
export type NewEvent = Insert<'events'>
export type NewFeaturedItem = Insert<'featured_items'>
export type NewNewsletterSubscription = Insert<'newsletter_subscriptions'>
export type NewPageView = Insert<'page_views'>

// Update types
export type UpdateUser = Update<'users'>
export type UpdateCategory = Update<'categories'>
export type UpdateProduct = Update<'products'>
export type UpdateProductImage = Update<'product_images'>
export type UpdateAddress = Update<'addresses'>
export type UpdateOrder = Update<'orders'>
export type UpdateOrderItem = Update<'order_items'>
export type UpdateArticle = Update<'articles'>
export type UpdateEvent = Update<'events'>
export type UpdateFeaturedItem = Update<'featured_items'>
export type UpdateNewsletterSubscription = Update<'newsletter_subscriptions'>
export type UpdatePageView = Update<'page_views'>

// Extended types with relations
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}