# Schéma Base de Données MVP

## Architecture Validée

Le schéma MVP HerbisVeritas comprend 13 tables essentielles organisées en modules fonctionnels.

## Tables Principales

### Utilisateurs
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role user_role DEFAULT 'user',
  status TEXT DEFAULT 'active',
  newsletter_subscribed BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('user', 'admin', 'dev');
```

### E-commerce
```sql
-- Produits avec labels HerbisVeritas
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,
  description JSONB,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  labels herbis_label[] DEFAULT '{}',
  inci_ingredients TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  image_urls TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE herbis_label AS ENUM (
  'bio_certifie',
  'naturel',
  'vegan',
  'cruelty_free',
  'made_in_france',
  'zero_dechet',
  'commerce_equitable'
);

-- Commandes avec Stripe
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  stripe_payment_id TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'shipped',
  'delivered'
);
```

### Contenu
```sql
-- Articles magazine avec TipTap
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL,
  content JSONB NOT NULL,
  excerpt JSONB,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  featured_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partenaires points de vente
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description JSONB,
  address JSONB NOT NULL,
  contact_info JSONB,
  social_links JSONB,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Contraintes Fonctionnelles

### Labels HerbisVeritas
Sept labels de qualité définis avec validation stricte au niveau base de données.

### Internationalisation
Support FR/EN via champs JSONB pour contenus multilingues.

### Rôles Utilisateur
Trois niveaux d'autorisation avec permissions granulaires via RLS.

## Migration
Fichier migration unique `001_mvp_schema.sql` avec toutes les tables et contraintes.