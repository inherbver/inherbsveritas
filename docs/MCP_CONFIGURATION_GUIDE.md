# Guide de Configuration MCP pour HerbisVeritas

Ce document décrit la configuration des 3 serveurs MCP (Model Context Protocol) utilisés dans le projet HerbisVeritas.

## Serveurs MCP Configurés

### 1. Playwright MCP Server
**Package** : `@executeautomation/playwright-mcp-server`
**Version** : `^1.0.6`

#### Installation
```bash
npm install --save-dev @executeautomation/playwright-mcp-server
```

#### Configuration
Ce serveur fournit des outils pour l'automatisation de tests de navigateur et l'interaction avec les pages web.

**Fonctionnalités disponibles** :
- Navigation et contrôle du navigateur
- Capture d'écrans
- Interaction avec les éléments (click, fill, hover)
- Génération de code de test automatique
- Récupération de logs console
- Évaluation de JavaScript dans le navigateur
- Gestion des requêtes HTTP (GET, POST, PUT, PATCH, DELETE)

**Utilisation dans le projet** :
- Tests end-to-end avec Playwright
- Scripts de tests automatisés pour l'admin
- Validation des interfaces utilisateur

### 2. Context7 MCP Server
**Serveur** : Context7 (documentation de librairies)

#### Configuration
Ce serveur permet d'accéder à la documentation mise à jour des librairies et frameworks.

**Fonctionnalités disponibles** :
- Résolution automatique d'ID de librairies
- Récupération de documentation fraîche
- Support pour de nombreux frameworks (Next.js, React, Supabase, etc.)

**Utilisation dans le projet** :
- Consultation rapide de la documentation Next.js 15
- Référence pour les APIs Supabase
- Documentation des composants React et hooks

**Exemple d'usage** :
```typescript
// Résoudre l'ID d'une librairie
await resolveLibraryId("next.js")
// Puis récupérer la documentation
await getLibraryDocs("/vercel/next.js", { topic: "app-router" })
```

### 3. Supabase MCP Server
**Serveur** : Supabase (intégration base de données)

#### Configuration
Ce serveur fournit une interface directe avec la base de données Supabase du projet.

**Fonctionnalités disponibles** :
- Exécution de requêtes SQL
- Gestion des migrations
- Liste des tables et extensions
- Génération de types TypeScript
- Gestion des Edge Functions
- Branches de développement
- Logs et monitoring
- Audit de sécurité

**Utilisation dans le projet** :
- Migrations de base de données
- Requêtes SQL directes pour le debug
- Génération automatique des types TypeScript
- Déploiement des Edge Functions
- Monitoring et logs en temps réel

**Exemples de commandes** :
```bash
# Lister les tables
supabase.listTables()

# Exécuter une migration
supabase.applyMigration("add_user_roles", "ALTER TABLE...")

# Générer les types TypeScript
supabase.generateTypescriptTypes()
```

## Configuration dans Claude Code

### Prérequis
1. Avoir Claude Code installé et configuré
2. Un projet avec les dépendances npm appropriées
3. Variables d'environnement configurées pour Supabase

### Structure de Configuration Type

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["node_modules/@executeautomation/playwright-mcp-server/dist/index.js"],
      "cwd": "/path/to/project"
    },
    "context7": {
      "command": "context7-mcp-server",
      "env": {
        "CONTEXT7_API_KEY": "your-api-key"
      }
    },
    "supabase": {
      "command": "supabase-mcp-server",
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-anon-key",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

## Variables d'Environnement Requises

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ACCESS_TOKEN=your-access-token
```

### Context7 (optionnel)
```env
CONTEXT7_API_KEY=your-context7-api-key
```

## Fonctionnalités Spécifiques au Projet

### Tests E2E
- Configuration Playwright pour différents environnements (Windows, admin)
- Tests automatisés pour toutes les fonctionnalités CRUD admin
- Génération de code de test à partir d'interactions navigateur

### Base de Données
- Migrations automatiques avec validation
- Génération de types TypeScript synchronisée
- Monitoring en temps réel des performances
- Audit de sécurité automatisé

### Documentation
- Accès instantané à la doc Next.js 15 avec App Router
- Documentation Supabase mise à jour
- Référence des APIs Stripe pour les paiements

## Avantages de cette Configuration

1. **Développement Accéléré** : Accès direct aux docs et outils
2. **Tests Robustes** : Automatisation complète des tests navigateur
3. **Base de Données Fiable** : Gestion professionnelle des migrations et monitoring
4. **Documentation Fraîche** : Toujours à jour avec les dernières versions
5. **Debugging Efficace** : Logs en temps réel et requêtes SQL directes

## Migration vers un Autre Projet

1. Installer les dépendances MCP appropriées
2. Configurer les variables d'environnement
3. Adapter les scripts package.json pour les tests
4. Copier la structure de configuration MCP
5. Tester la connectivité avec chaque serveur

Cette configuration offre un environnement de développement complet et professionnel pour des applications Next.js avec Supabase.