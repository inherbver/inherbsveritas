-- HerbisVeritas V2 - MVP Database Schema (13 tables)
-- Migration: 001_mvp_schema.sql

-- ============================================================================
-- 1. CREATE ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'dev');
CREATE TYPE address_type AS ENUM ('shipping', 'billing');
CREATE TYPE order_status AS ENUM ('pending_payment', 'processing', 'shipped', 'delivered');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE product_label AS ENUM (
  'recolte_main',           -- "Récolté à la main"
  'bio',                    -- "Bio"
  'origine_occitanie',      -- "Origine Occitanie" 
  'partenariat_producteurs', -- "Partenariat producteurs locaux"
  'rituel_bien_etre',       -- "Rituel de bien-être"
  'rupture_recolte',        -- "Rupture de récolte"
  'essence_precieuse'       -- "Essence précieuse"
);
CREATE TYPE featured_type AS ENUM ('product', 'article', 'event');

-- ============================================================================
-- 2. CREATE TABLES (Order: users → addresses → categories → products → carts/orders → content)
-- ============================================================================

-- 1. USERS (3 roles MVP)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  
  -- Identité
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  
  -- Rôles MVP (3 seulement)
  role user_role DEFAULT 'user',
  status TEXT DEFAULT 'active',
  
  -- Business
  newsletter_subscribed BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADDRESSES (FK moderne)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type
  address_type address_type NOT NULL,
  is_default BOOLEAN DEFAULT false,
  
  -- Informations
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  
  -- Adresse
  street_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country_code TEXT DEFAULT 'FR',
  state_province_region TEXT,
  
  -- Contact
  phone_number TEXT,
  email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES (Hiérarchique + i18n JSONB)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  
  -- Contenu français (défaut)
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color (#FF5733)
  
  -- i18n JSONB (décision MVP)
  translations JSONB DEFAULT '{}',
  
  -- Gestion
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS (Cosmétique avec Labels HerbisVeritas)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  -- Informations de base (français)
  name TEXT NOT NULL,
  description_short TEXT,
  description_long TEXT,
  
  -- Commerce
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pièce',
  
  -- Médias
  image_url TEXT,
  
  -- Spécificités cosmétique (CRITIQUE MVP)
  inci_list TEXT[], -- Liste ingrédients INCI (réglementation EU)
  labels product_label[] DEFAULT '{}', -- Labels HerbisVeritas
  
  -- États
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  
  -- i18n JSONB (cohérence avec categories)
  translations JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARTS (Système Guest/User MVP)
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL si invité
  guest_id TEXT,                      -- Session invité (décision MVP)
  
  status TEXT DEFAULT 'active',       -- active | completed | abandoned
  metadata JSONB DEFAULT '{}',        -- Données flexibles
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CART_ITEMS (Articles Panier)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS (Commandes avec Stripe Complet)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE, -- Généré automatiquement
  user_id UUID REFERENCES users(id) NOT NULL,
  
  -- États MVP (4 états décision)
  status order_status DEFAULT 'pending_payment',
  payment_status payment_status DEFAULT 'pending',
  
  -- Montants
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  shipping_fee DECIMAL(10,2) DEFAULT 4.90, -- Prix fixe Colissimo MVP
  
  -- Adresses
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  
  -- Stripe intégration complète (décision MVP)
  payment_method TEXT,
  payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_checkout_id TEXT,
  
  -- Logistique basique
  shipping_method TEXT DEFAULT 'colissimo',
  tracking_number TEXT,
  tracking_url TEXT,
  
  -- Métadonnées
  notes TEXT,
  
  -- Timestamps logistiques
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- 8. ORDER_ITEMS (Articles Commande avec Snapshot)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Quantité et prix figés
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  
  -- Snapshot produit (historique)
  product_name_at_purchase TEXT,
  product_image_url_at_purchase TEXT,
  product_sku_at_purchase TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ARTICLES (Magazine TipTap)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES users(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  -- Contenu français (défaut)
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL,     -- TipTap JSON (décision MVP)
  content_html TEXT,          -- HTML généré
  
  -- Médias
  featured_image TEXT,
  
  -- États
  status TEXT DEFAULT 'draft', -- draft | published | archived
  published_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- i18n JSONB (cohérence architecture)
  translations JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PARTNERS (Points de Vente avec Réseaux Sociaux)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations boutique
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- Réseaux sociaux (décision finale)
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Gestion page "Nous retrouver"
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NEXT_EVENTS (Événement Hero Simple)
CREATE TABLE next_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations événement
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,           -- "2025-02-15"
  time_start TIME NOT NULL,     -- "09:00"
  time_end TIME,                -- "17:00"
  location TEXT NOT NULL,
  
  -- Médias
  image_url TEXT,
  
  -- Gestion Hero homepage
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NEWSLETTER_SUBSCRIBERS (Abonnements Basiques)
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  
  -- États
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées basiques (pas tracking RGPD)
  source TEXT, -- "website" | "popup" | "checkout"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FEATURED_ITEMS (Hero Polyvalent)
CREATE TABLE featured_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polyvalence Hero (décision finale)
  type featured_type NOT NULL,    -- product | article | event
  item_id UUID NOT NULL,          -- FK polymorphe
  
  -- Customisation affichage
  title_override TEXT,
  subtitle TEXT,
  image_override TEXT,
  
  -- Gestion
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Addresses
CREATE UNIQUE INDEX idx_addresses_default_shipping 
  ON addresses(user_id) WHERE address_type = 'shipping' AND is_default = true;
CREATE UNIQUE INDEX idx_addresses_default_billing 
  ON addresses(user_id) WHERE address_type = 'billing' AND is_default = true;

-- Categories
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_labels ON products USING GIN(labels);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_search ON products 
  USING gin(to_tsvector('french', name || ' ' || COALESCE(description_short, '')));

-- Carts
CREATE INDEX idx_carts_user ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_guest ON carts(guest_id) WHERE guest_id IS NOT NULL;

-- Cart Items
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_cart_items_product_cart ON cart_items(product_id, cart_id);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_recent ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Articles
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC) 
  WHERE status = 'published';
CREATE INDEX idx_articles_search ON articles
  USING gin(to_tsvector('french', title || ' ' || COALESCE(excerpt, '')));

-- Partners
CREATE INDEX idx_partners_active ON partners(display_order) WHERE is_active = true;

-- Next Events
CREATE UNIQUE INDEX idx_next_events_active ON next_events(is_active) 
  WHERE is_active = true;

-- Newsletter
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(email) 
  WHERE is_active = true;

-- Featured Items
CREATE INDEX idx_featured_active ON featured_items(display_order) 
  WHERE is_active = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_admin_access" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Addresses policies
CREATE POLICY "addresses_own" ON addresses
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "addresses_admin" ON addresses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories policies (public read, admin write)
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Products policies
CREATE POLICY "products_public_view" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Carts policies
CREATE POLICY "carts_own_user" ON carts
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "carts_admin" ON carts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Cart items policies (via cart ownership)
CREATE POLICY "cart_items_own" ON cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM carts WHERE id = cart_id AND user_id = auth.uid())
  );
CREATE POLICY "cart_items_admin" ON cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders policies
CREATE POLICY "orders_own" ON orders
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "orders_admin" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Order items policies (via order ownership)
CREATE POLICY "order_items_own" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "order_items_admin" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Articles policies
CREATE POLICY "articles_public" ON articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "articles_admin" ON articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Partners policies (public read, admin write)
CREATE POLICY "partners_public_read" ON partners
  FOR SELECT USING (is_active = true);
CREATE POLICY "partners_admin_write" ON partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Next events policies (public read, admin write)
CREATE POLICY "next_events_public_read" ON next_events
  FOR SELECT USING (is_active = true);
CREATE POLICY "next_events_admin_write" ON next_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Newsletter policies
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true); -- Anyone can subscribe
CREATE POLICY "newsletter_admin_all" ON newsletter_subscribers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Featured items policies (public read, admin write)
CREATE POLICY "featured_items_public_read" ON featured_items
  FOR SELECT USING (is_active = true);
CREATE POLICY "featured_items_admin_write" ON featured_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_next_events_updated_at BEFORE UPDATE ON next_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_featured_items_updated_at BEFORE UPDATE ON featured_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. INITIAL DATA (Optional)
-- ============================================================================

-- Insert default categories
INSERT INTO categories (slug, name, description, sort_order) VALUES
('cosmetics', 'Cosmétiques', 'Produits cosmétiques naturels et bio', 1),
('soaps', 'Savons', 'Savons artisanaux aux huiles essentielles', 2),
('essential-oils', 'Huiles Essentielles', 'Huiles essentielles pures d''Occitanie', 3);

-- Migration completed successfully