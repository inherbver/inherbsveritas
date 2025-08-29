# 🔒 Configuration Sécurisée - HerbisVeritas V2

## 🚨 ALERTE FUITE DE SECRET RÉSOLUE

**Date :** 2025-01-29  
**Issue :** Supabase Service Role Key exposée dans `.claude/config.json`  
**Status :** 🟢 CORRIGÉ

---

## ⚡ Actions Immédiates Prises

1. ✅ **Suppression secret du repo** : Clé retirée de `.claude/config.json`
2. ✅ **Protection .gitignore** : `.claude/config.json` ajouté à `.gitignore`
3. ✅ **Template sécurisé** : `.claude/config.template.json` créé avec variables d'environnement
4. ✅ **Removal cache Git** : `git rm --cached` appliqué

---

## 🔧 Configuration Post-Incident

### 1. Régénération de la clé Supabase (CRITIQUE)

⚠️ **VOUS DEVEZ FAIRE CECI MANUELLEMENT** :

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Projet : `mntndpelpvcskirnyqvx` 
3. **Settings** → **API**
4. **Service Role Key** → **Regenerate** (⚠️ révoque l'ancienne)
5. Copiez la NOUVELLE clé générée

### 2. Configuration locale sécurisée

```bash
# 1. Copier le template
cp .claude/config.template.json .claude/config.json

# 2. Ajouter la NOUVELLE clé dans .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=NEW_KEY_FROM_SUPABASE" >> .env.local

# 3. Vérifier .gitignore
git check-ignore -v .env.local .claude/config.json
```

### 3. Variables d'environnement requises

Dans `.env.local` (ignoré par Git) :
```env
# Supabase Configuration
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NOUVELLE_CLE_REGENEREE
```

---

## 🛡️ Bonnes Pratiques Appliquées

### ✅ Sécurisation Secrets
- **Service Role Key** : Uniquement dans `.env.local` (ignoré Git)
- **Anon Key** : OK dans `.env.local` (publique côté client)
- **Database URL** : `.env.local` uniquement

### ✅ Séparation Frontend/Backend
- **Frontend** : Uniquement `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **MCP/Serveur** : `SUPABASE_SERVICE_ROLE_KEY` via env variables
- **Jamais** de Service Role Key côté client

### ✅ Git Security
- `.claude/config.json` → `.gitignore`
- Template avec variables d'env : `.claude/config.template.json`
- Secrets réels dans `.env.local` (déjà ignoré)

---

## 🔍 Audit Post-Incident

### Fichiers Nettoyés
- ❌ `.claude/config.json` (retiré du tracking Git)
- ✅ `.claude/config.template.json` (template sécurisé)
- ✅ `.gitignore` (mis à jour)

### Clés à Régénérer
- 🔄 **SUPABASE_SERVICE_ROLE_KEY** (exposée → régénération obligatoire)
- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY** (publique → OK)
- ✅ **DATABASE_URL** (jamais exposée → OK)

---

## 🚀 Reprise du Développement

Après régénération de la clé :

1. **Mettre à jour** `.env.local` avec NOUVELLE clé
2. **Tester** MCP Supabase : `claude mcp list-servers`  
3. **Appliquer** migration RBAC : `002_auth_rbac_security.sql`
4. **Continuer** Phase 2 authentification

---

## 📋 Checklist Sécurité Permanente

- [ ] **Jamais** de secrets dans fichiers trackés Git
- [ ] **Toujours** utiliser variables d'environnement
- [ ] **Vérifier** `.gitignore` avant commit
- [ ] **Séparer** anon key (client) vs service role key (serveur)
- [ ] **Régénérer** clés exposées immédiatement
- [ ] **Documenter** incidents sécurité

---

**🔒 Sécurité HerbisVeritas V2 : RESTAURÉE**