# HerbisVeritas V2 - Index Documentation

## Navigation Rapide

### Spécifications
- [Exigences Fonctionnelles](./specifications/exigences-fonctionnelles.md) - Contraintes MVP et fonctionnalités
- [Schéma Base de Données](./specifications/schema-base-donnees.md) - Architecture 13 tables

### Architecture
- [Infrastructure Composants](./architecture/infrastructure-composants.md) - Patterns évolutifs MVP → V2
- [Système Messages](./architecture/systeme-messages.md) - AuthMessage + Toasts centralisés

### Guides Techniques
- [Setup Développement](./guides/setup-developpement.md) - Installation et configuration
- [Déploiement](./guides/deploiement.md) - Pipeline CI/CD et production
- [Performance](./guides/performance.md) - Optimisations et monitoring

### Sécurité
- [Guidelines Sécurité](./security/guidelines-securite.md) - Protection OWASP et RLS

## Informations Projet

**Version :** MVP 1.0  
**Stack :** Next.js 15 + TypeScript + Supabase  
**Environnement :** Production-ready  
**Timeline :** 12 semaines MVP  

## Démarrage Rapide

```bash
# Installation
npm install
cp .env.local.example .env.local

# Configuration base de données
npm run db:reset

# Développement
npm run dev
```

## Architecture MVP

- 13 tables validées
- 3 rôles utilisateur (guest/user/admin)
- Labels HerbisVeritas (7 labels définis)
- Internationalisation FR/EN
- Messages centralisés AuthMessage
- Infrastructure composants évolutive