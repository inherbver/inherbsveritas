# HerbisVeritas V2 - Documentation Professionnelle

## Vue d'ensemble

HerbisVeritas V2 est une plateforme e-commerce spécialisée dans les cosmétiques biologiques avec système de labels qualité propriétaires et architecture moderne Next.js 15.

## Architecture

- **Stack technique :** Next.js 15 + TypeScript + Supabase + Tailwind CSS
- **Base de données :** 13 tables MVP optimisées
- **Authentification :** 3 rôles (guest/user/admin)
- **Internationalisation :** FR/EN
- **Messages :** Système centralisé AuthMessage + Toasts

## Structure Documentation

### [📋 Spécifications](./specifications/)
- Exigences fonctionnelles
- Schéma base de données
- API specifications

### [🏗️ Architecture](./architecture/)
- Infrastructure composants
- Patterns de développement
- Système de messages

### [🔧 Guides Techniques](./guides/)
- Setup développement
- Déploiement
- Performance

### [🔒 Sécurité](./security/)
- Guidelines sécurité
- Authentification
- Protection données

## Démarrage Rapide

1. **Installation :** `npm install`
2. **Configuration :** Copier `.env.local.example` → `.env.local`
3. **Base de données :** `npm run db:reset`
4. **Développement :** `npm run dev`

## Contacts Projet

- **Environnement :** Production-ready
- **Support :** Documentation technique complète
- **Version :** MVP 1.0