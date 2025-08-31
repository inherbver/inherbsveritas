# Exigences Fonctionnelles MVP

## Objectifs Business

HerbisVeritas V2 constitue une plateforme e-commerce spécialisée dans les cosmétiques biologiques avec système de labels qualité propriétaires.

### Contraintes MVP
- Architecture 13 tables validées
- 3 rôles utilisateur (guest/user/admin)
- Internationalisation FR/EN uniquement
- Labels HerbisVeritas : 7 labels définis
- Launch-ready sous 12 semaines

## Fonctionnalités Essentielles

### Authentification
- Inscription/connexion utilisateur
- Gestion 3 rôles avec permissions
- Récupération mot de passe
- Validation email obligatoire

### Catalogue Produits
- Affichage produits avec filtres
- Catégories organisées
- Recherche textuelle
- Images optimisées
- Labels HerbisVeritas intégrés

### Commande
- Panier invité fonctionnel
- Calcul frais de port
- Intégration Stripe sécurisée
- Confirmation commande
- Historique utilisateur

### Administration
- Gestion produits CRUD
- Gestion commandes
- Statistiques essentielles
- Modération contenu

## Contraintes Techniques

### Performance
- Temps chargement inférieur 2 secondes
- Score Lighthouse supérieur 90
- Optimisation images automatique
- Cache stratégique

### Sécurité
- Protection OWASP Top 10
- Validation côté serveur
- Rate limiting API
- Chiffrement données sensibles

### Qualité Code
- Couverture tests supérieure 80 pourcent
- TypeScript strict mode
- Linting automatique
- Tests TDD obligatoires