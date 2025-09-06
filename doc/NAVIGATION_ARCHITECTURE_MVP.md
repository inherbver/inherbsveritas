# Architecture de Navigation MVP - HerbisVeritas V2

**Version :** 1.0.0  
**Date :** 2025-01-28  
**Statut :** ✅ IMPLEMENTED & STRUCTURED

## 🎯 Vue d'ensemble Navigation

Architecture de navigation simplifiée et centrée sur l'e-commerce, avec la boutique comme landing page principale. Suppression de la notion de "page d'accueil" classique au profit d'une expérience directement commerciale.

## 🏗️ Structure de Navigation Principale

### **🛍️ Landing Page : Boutique (`/shop`)**
- **Route** : `/{locale}/shop` → redirigée depuis `/` 
- **Fonction** : Page d'entrée principale avec catalogue complet
- **Features** :
  - Catalogue produits avec filtres (catégories, labels)
  - Recherche intégrée (implémentée en V2)
  - Actions panier optimisées
  - SEO optimisé comme homepage

### **📱 Produit Détail (`/products/[slug]`)**
- **Route** : `/{locale}/products/[slug]`
- **Fonction** : Fiche produit complète
- **Features** :
  - Composition INCI détaillée
  - Labels HerbisVeritas
  - Actions panier avec quantités
  - Produits suggérés
  - Breadcrumb navigation

### **📰 Magazine (`/articles`)**
- **Route** : `/{locale}/articles`
- **Fonction** : Liste articles blog/conseils
- **Features** :
  - Grille articles avec pagination
  - Filtres par catégories
  - Article featured principal
  - Newsletter signup

### **📄 Article Détail (`/articles/[slug]`)**
- **Route** : `/{locale}/articles/[slug]`
- **Fonction** : Article complet avec contenu riche
- **Features** :
  - Contenu formaté (HTML/Markdown)
  - Partage social
  - Articles suggérés
  - Temps de lecture

### **🤝 Nous rencontrer (`/nous-rencontrer`)**
- **Route** : `/{locale}/nous-rencontrer`
- **Fonction** : Contact + Partenaires fusionnés
- **Features** :
  - Formulaire de contact
  - Informations atelier
  - Points de vente partenaires
  - CTA devenir partenaire

## 🔄 Navigation E-commerce

### **💳 Tunnel de Commande**
```
🛒 Panier (Sheet/Modal) → 🚀 Checkout → ✅ Success / ❌ Cancel
```

- **Panier** : Sheet/Modal (pas de page dédiée)
- **Checkout** : `/{locale}/checkout` (à créer)
- **Success** : `/checkout/success` ✅ Implémenté
- **Cancel** : `/checkout/cancel` ✅ Implémenté

### **👤 Espace Utilisateur**
```
👤 Mon Compte → 📋 Commandes / 👤 Profil / 📍 Adresses
```

- **Landing compte** : `/{locale}/account` (à créer)
- **Commandes** : `/{locale}/account/orders` (à créer)  
- **Profil** : `/{locale}/account/profile` (à créer)
- **Adresses** : `/{locale}/account/addresses` (à créer)

### **🔐 Authentification**
```
🔑 Login / ✍️ Signup / 🔄 Reset Password
```

- **Login** : `/{locale}/login` (existe : `/login`)
- **Signup** : `/{locale}/signup` (existe : `/signup`)
- **Reset** : `/{locale}/reset-password` (à créer)

## 🛡️ Administration

### **🔒 Interface Admin**
```
📊 Dashboard → 📦 Produits / 📝 Articles / 🤝 Partenaires
```

- **Dashboard** : `/{locale}/admin` (structure existe)
- **Produits** : `/{locale}/admin/products` (à créer)
- **Articles** : `/{locale}/admin/articles` (à créer)
- **Partenaires** : `/{locale}/admin/partners` (à créer)

## 📊 État d'Implémentation

### **✅ Pages Implémentées**
- [x] **Shop Landing** : `/{locale}/shop` ✅ Complète avec filtres
- [x] **Produit Détail** : `/{locale}/products/[slug]` ✅ Interface complète
- [x] **Articles Liste** : `/{locale}/articles` ✅ Grille + filtres
- [x] **Article Détail** : `/{locale}/articles/[slug]` ✅ Contenu riche
- [x] **Nous rencontrer** : `/{locale}/nous-rencontrer` ✅ Contact + Partenaires
- [x] **Checkout Success** : `/checkout/success` ✅ UX complète
- [x] **Checkout Cancel** : `/checkout/cancel` ✅ UX complète
- [x] **Redirection Root** : `/{locale}` → `/{locale}/shop` ✅ Automatique

### **⏳ Pages à Créer**
- [ ] **Checkout Principal** : `/{locale}/checkout`
- [ ] **Account Landing** : `/{locale}/account`
- [ ] **Mes Commandes** : `/{locale}/account/orders`
- [ ] **Mon Profil** : `/{locale}/account/profile`  
- [ ] **Mes Adresses** : `/{locale}/account/addresses`
- [ ] **Reset Password** : `/{locale}/reset-password`

### **🛡️ Administration à Créer**
- [ ] **Admin Dashboard** : `/{locale}/admin`
- [ ] **Admin Produits** : `/{locale}/admin/products`
- [ ] **Admin Articles** : `/{locale}/admin/articles`
- [ ] **Admin Partenaires** : `/{locale}/admin/partners`

## 🎨 Composants Navigation

### **Header Navigation Principal**
```typescript
interface MainNavItem {
  label: string
  href: string
  external?: boolean
}

const mainNavItems: MainNavItem[] = [
  { label: 'Boutique', href: '/shop' },
  { label: 'Magazine', href: '/articles' },
  { label: 'Nous rencontrer', href: '/nous-rencontrer' },
]
```

### **Footer Navigation**
```typescript
const footerSections = {
  boutique: [
    { label: 'Tous les produits', href: '/shop' },
    { label: 'Nouveautés', href: '/shop?new=true' },
    { label: 'Labels bio', href: '/shop?labels=bio' },
  ],
  aide: [
    { label: 'Contact', href: '/nous-rencontrer' },
    { label: 'Livraison', href: '/help/shipping' },
    { label: 'Retours', href: '/help/returns' },
  ],
  compte: [
    { label: 'Mon compte', href: '/account' },
    { label: 'Mes commandes', href: '/account/orders' },
    { label: 'Connexion', href: '/login' },
  ]
}
```

## 🔍 SEO & Métadonnées

### **Pages Principales**
- **Shop** : Métadonnées homepage avec mots-clés e-commerce
- **Produits** : Schema.org Product + OpenGraph product
- **Articles** : Schema.org Article + OpenGraph article
- **Contact** : LocalBusiness schema pour SEO local

### **Sitemap Structure**
```xml
/shop (priority: 1.0, changefreq: daily)
/articles (priority: 0.8, changefreq: weekly)  
/nous-rencontrer (priority: 0.6, changefreq: monthly)
/products/[slug] (priority: 0.9, changefreq: weekly)
/articles/[slug] (priority: 0.7, changefreq: never)
```

## 📱 Responsive & UX

### **Mobile Navigation**
- **Hamburger Menu** pour navigation principale
- **Bottom Navigation** pour actions critiques (panier, compte)
- **Search** en modal fullscreen
- **Filtres** en drawer/sheet

### **Desktop Navigation**
- **Header fixe** avec navigation horizontale
- **Mega Menu** pour catégories produits (V2)
- **Sidebar** filtres sur page shop
- **Breadcrumbs** pour navigation contextuels

## 🌐 Internationalisation

### **Structure i18n Actuelle**
```
/[locale]/shop         # Boutique localisée
/[locale]/articles     # Magazine localisé  
/[locale]/nous-rencontrer  # Contact localisé
```

### **Locales Supportées MVP**
- **FR** : Français (par défaut, fallback)
- **EN** : English (traductions requises)
- **DE/ES** : Reportées en V2

## 🔧 Actions Techniques

### **Prochaines Étapes Immédiates**
1. **Créer composant Header** avec navigation principale
2. **Implémenter breadcrumbs** cross-pages
3. **Créer pages account** manquantes
4. **Configurer sitemap** automatique
5. **Tests navigation** E2E complets

### **Intégrations Requises**
- **Liens panier** : CheckoutButton vers /checkout
- **Auth guards** : Pages account protégées
- **Admin guards** : Pages admin avec RBAC
- **404 handling** : Pages inexistantes
- **Search** : Intégration avec filtres shop

---

**🎯 RÉSULTAT : Architecture de navigation MVP centrée e-commerce, simple et efficace, prête pour implémentation des pages manquantes.**