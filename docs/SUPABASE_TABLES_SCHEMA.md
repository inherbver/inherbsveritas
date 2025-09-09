# Schéma Tables Supabase - HerbisVeritas MVP

## Vue d'ensemble

Base de données Supabase PostgreSQL avec 13 tables MVP conformes à l'architecture définie dans `DATABASE_SCHEMA_MVP.md`.

**État :** ✅ Toutes les tables créées avec RLS activé  
**Données :** 9 produits et 3 catégories en place pour développement  

---

## 📊 Tables Principales (13 tables MVP)

### 1. **👤 `users`** - Gestion utilisateurs
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `email` | text | Email (unique) |
| `first_name` | text | Prénom |
| `last_name` | text | Nom |
| `phone_number` | text | Téléphone |
| `role` | user_role | Rôle (user/admin/dev) |
| `status` | text | Statut compte |
| `newsletter_subscribed` | boolean | Abonnement newsletter |
| `terms_accepted_at` | timestamptz | Date acceptation CGV |
| `last_activity` | timestamptz | Dernière activité |

**Contraintes :**
- Rôles : Enum `user_role` (user, admin, dev)
- Défaut : `'user'::user_role`

---

### 2. **📍 `addresses`** - Adresses livraison/facturation
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `user_id` | uuid | Référence utilisateur |
| `address_type` | address_type | Type (shipping/billing) |
| `is_default` | boolean | Adresse par défaut |
| `first_name` | text | Prénom destinataire |
| `last_name` | text | Nom destinataire |
| `company_name` | text | Nom société (optionnel) |
| `street_number` | text | Numéro de rue |
| `address_line1` | text | Adresse ligne 1 |
| `address_line2` | text | Adresse ligne 2 (optionnel) |
| `city` | text | Ville |
| `postal_code` | text | Code postal |
| `country_code` | text | Code pays (défaut: FR) |
| `state_province_region` | text | Région/État |
| `phone_number` | text | Téléphone |
| `email` | text | Email |

**Contraintes :**
- Types : Enum `address_type` (shipping, billing)

---

### 3. **📂 `categories`** - Catégories produits hiérarchiques
**RLS activé** | **3 lignes** ✅

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `slug` | text | Slug unique pour URLs |
| `parent_id` | uuid | Catégorie parent (hiérarchique) |
| `name` | text | Nom de la catégorie |
| `description` | text | Description |
| `color` | text | Couleur d'affichage |
| `translations` | jsonb | Traductions i18n |
| `sort_order` | integer | Ordre d'affichage |

**Fonctionnalités :**
- Structure hiérarchique avec `parent_id`
- Support i18n via JSONB `translations`
- Tri personnalisé via `sort_order`

---

### 4. **🧴 `products`** - Produits cosmétiques ⭐ CENTRALE
**RLS activé** | **9 lignes** ✅

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `slug` | text | Slug unique pour URLs |
| `category_id` | uuid | Référence catégorie |
| `name` | text | Nom du produit |
| `description_short` | text | Description courte |
| `description_long` | text | Description détaillée |
| `price` | numeric | Prix |
| `currency` | text | Devise (défaut: EUR) |
| `stock` | integer | Stock disponible |
| `unit` | text | Unité (défaut: pièce) |
| `image_url` | text | URL image principale |
| `inci_list` | text[] | Liste ingrédients INCI |
| `labels` | product_label[] | Labels HerbisVeritas |
| `status` | text | Statut (défaut: active) |
| `is_active` | boolean | Visibilité publique |
| `is_new` | boolean | Badge "Nouveau" |
| `translations` | jsonb | Traductions i18n |

**Labels HerbisVeritas (Enum `product_label`) :**
1. `recolte_main` - "Récolté à la main"
2. `bio` - "Bio"
3. `origine_occitanie` - "Origine Occitanie"
4. `partenariat_producteurs` - "Partenariat producteurs"
5. `rituel_bien_etre` - "Rituel bien-être"
6. `rupture_recolte` - "Rupture de récolte"
7. `essence_precieuse` - "Essence précieuse"

---

### 5. **🛒 `carts`** - Paniers utilisateurs/invités
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `user_id` | uuid | Utilisateur connecté (optionnel) |
| `guest_id` | text | Session invité (optionnel) |
| `status` | text | Statut panier (défaut: active) |
| `metadata` | jsonb | Métadonnées additionnelles |

**Fonctionnalités :**
- Support utilisateurs connectés (`user_id`)
- Support invités (`guest_id`)
- Métadonnées flexibles via JSONB

---

### 6. **📦 `cart_items`** - Items dans paniers
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `cart_id` | uuid | Référence panier |
| `product_id` | uuid | Référence produit |
| `quantity` | integer | Quantité (défaut: 1) |
| `added_at` | timestamptz | Date d'ajout |

---

### 7. **🧾 `orders`** - Commandes e-commerce
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `order_number` | text | Numéro commande (unique) |
| `user_id` | uuid | Référence utilisateur |
| `status` | order_status | Statut commande |
| `payment_status` | payment_status | Statut paiement |
| `total_amount` | numeric | Montant total |
| `currency` | text | Devise (défaut: EUR) |
| `shipping_fee` | numeric | Frais port (défaut: 4.90) |
| `shipping_address_id` | uuid | Adresse livraison |
| `billing_address_id` | uuid | Adresse facturation |
| `payment_method` | text | Méthode paiement |
| `payment_intent_id` | text | ID Stripe PaymentIntent |
| `stripe_checkout_session_id` | text | ID session Stripe |
| `stripe_checkout_id` | text | ID checkout Stripe |
| `shipping_method` | text | Méthode expédition (défaut: colissimo) |
| `tracking_number` | text | Numéro suivi |
| `tracking_url` | text | URL suivi |
| `notes` | text | Notes commande |
| `shipped_at` | timestamptz | Date expédition |
| `delivered_at` | timestamptz | Date livraison |

**Enums Statuts :**
- `order_status` : pending_payment, processing, shipped, delivered
- `payment_status` : pending, succeeded, failed, refunded

---

### 8. **📋 `order_items`** - Items commandés (snapshot prix)
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `order_id` | uuid | Référence commande |
| `product_id` | uuid | Référence produit |
| `quantity` | integer | Quantité commandée |
| `price_at_purchase` | numeric | Prix au moment achat |
| `product_name_at_purchase` | text | Nom produit au moment achat |
| `product_image_url_at_purchase` | text | Image produit au moment achat |
| `product_sku_at_purchase` | text | SKU produit au moment achat |

**Fonctionnalités :**
- Snapshot des données produit au moment de l'achat
- Préservation historique des prix

---

### 9. **📰 `articles`** - Blog/Magazine CMS
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `slug` | text | Slug unique pour URLs |
| `author_id` | uuid | Référence auteur |
| `category_id` | uuid | Référence catégorie |
| `title` | text | Titre article |
| `excerpt` | text | Extrait/résumé |
| `content` | jsonb | Contenu riche (JSON) |
| `content_html` | text | Contenu HTML rendu |
| `featured_image` | text | Image mise en avant |
| `status` | text | Statut (défaut: draft) |
| `published_at` | timestamptz | Date publication |
| `seo_title` | text | Titre SEO |
| `seo_description` | text | Description SEO |
| `translations` | jsonb | Traductions i18n |

**Fonctionnalités :**
- Contenu riche via JSONB
- SEO optimisé
- Support i18n

---

### 10. **🤝 `partners`** - Partenaires producteurs
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `name` | text | Nom partenaire |
| `description` | text | Description |
| `address` | text | Adresse |
| `image_url` | text | URL image |
| `facebook_url` | text | URL Facebook |
| `instagram_url` | text | URL Instagram |
| `display_order` | integer | Ordre affichage |
| `is_active` | boolean | Visibilité |

---

### 11. **📅 `next_events`** - Événements futurs
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `title` | text | Titre événement |
| `description` | text | Description |
| `date` | date | Date événement |
| `time_start` | time | Heure début |
| `time_end` | time | Heure fin |
| `location` | text | Lieu |
| `image_url` | text | URL image |
| `is_active` | boolean | Visibilité |

---

### 12. **📧 `newsletter_subscribers`** - Abonnés newsletter
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `email` | text | Email (unique) |
| `is_active` | boolean | Abonnement actif |
| `subscribed_at` | timestamptz | Date abonnement |
| `source` | text | Source inscription |

---

### 13. **⭐ `featured_items`** - Items mis en avant
**RLS activé** | **0 lignes**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | Identifiant unique |
| `type` | featured_type | Type (product/article/event) |
| `item_id` | uuid | Référence item |
| `title_override` | text | Titre personnalisé |
| `subtitle` | text | Sous-titre |
| `image_override` | text | Image personnalisée |
| `is_active` | boolean | Visibilité |
| `display_order` | integer | Ordre affichage |

**Types :** Enum `featured_type` (product, article, event)

---

## 🔗 Relations Clés

### Produits → Catégories
```sql
products.category_id → categories.id
```

### Paniers → Utilisateurs/Invités
```sql
carts.user_id → users.id (optionnel)
carts.guest_id → session_id (optionnel)
```

### Commandes → Utilisateurs + Adresses
```sql
orders.user_id → users.id
orders.shipping_address_id → addresses.id
orders.billing_address_id → addresses.id
```

### Articles → Auteurs + Catégories
```sql
articles.author_id → users.id
articles.category_id → categories.id
```

---

## 🛡️ Sécurité (RLS)

**Row Level Security activé sur toutes les tables :**
- Contrôle d'accès granulaire par ligne
- Politiques par rôle utilisateur (user/admin/dev)
- Protection des données sensibles

**Note :** Client admin temporairement utilisé pour contourner les problèmes RLS en développement.

---

## 📈 État des Données

### Données de Test Présentes
- **`categories`** : 3 catégories ✅
- **`products`** : 9 produits avec labels HerbisVeritas ✅

### Données à Créer (MVP)
- Users, addresses, carts, orders (à remplir selon besoins)
- Articles, partners, events (contenus éditoriaux)
- Newsletter subscribers (collecte utilisateurs)

---

## 🎯 Points Critiques MVP

### Pour ProductCard (Shop)
Utilise : `name`, `price`, `image_url`, `labels[]`, `stock`, `is_new`

### Pour ProductDetails (Pages Produit)
Utilise : Tous les champs ProductCard + `description_long`, `inci_list[]`, `translations`

### Labels HerbisVeritas
**7 labels obligatoires** définis par enum `product_label` - Élément différenciateur clé de la marque.

---

**Dernière mise à jour :** 8 septembre 2025  
**Version :** MVP 1.0  
**Statut :** ✅ Toutes tables créées et RLS configuré