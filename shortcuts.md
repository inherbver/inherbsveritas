# Claude Code Shortcuts

## Terminal Shortcuts Configurés

### Aliases Bash
```bash
# Dans ton terminal (avant Claude Code)
cc        # → "Consulte CLAUDE.md et applique les patterns définis"
dp        # → "Consulte docs/DEVELOPMENT_PLAN_MVP.md et indique où nous en sommes"
orthodox  # → "Vérifie cohérence entre docs/DEVELOPMENT_PLAN_MVP.md, docs/DATABASE_SCHEMA_MVP.md et architecture 13 tables"
github    # → "Analyse pending changes, mise à jour documentation si pertinent, commit selon patterns CLAUDE.md et push vers remote"
build     # → "Lance npm run build + vérification erreurs + rapport de performance + validation MVP"
c7        # → "Commdpençons la prochaine étape recommandée avec recherche Context7 + génération NEXT_STEP.md"
nl        # → Saut de ligne 
tt        # → Séparateur de sections avec lignes
```

### Usage Efficace
```bash
# 1. Dans terminal
$ cc
> Consulte CLAUDE.md et applique les patterns définis

$ dp  
> Consulte docs/DEVELOPMENT_PLAN_MVP.md et indique où nous en sommes

$ orthodox
> Vérifie cohérence entre docs/DEVELOPMENT_PLAN_MVP.md, docs/DATABASE_SCHEMA_MVP.md et architecture 13 tables

$ github
> Analyse pending changes, commit selon patterns CLAUDE.md et push vers remote

$ build
> Lance npm run build + vérification erreurs + rapport de performance + validation MVP

$ c7
> Commençons la prochaine étape recommandée avec recherche Context7 + génération NEXT_STEP.md

# 2. Copier-coller dans Claude Code
# 3. Pour structurer tes prompts
$ tt
> 
> 
> ---
> 
```

## Alternative : Snippets Rapides

**Pour copier-coller direct :**
- `cc` → Consulte CLAUDE.md et applique les patterns définis
- `dp` → Consulte docs/DEVELOPMENT_PLAN_MVP.md et indique où nous en sommes  
- `ts` → Utilise le sous-agent dédié afin d'analyser et de résoudre les erreurs de typage (pas d'any, unknown en cas de grande difficultés à typer)
- `orthodox` → Vérifie cohérence des fichiers doc C:\inherbisveritas\doc et leur actualité avec la codebase et la base de données
- `github` → Analyse pending changes, commit selon patterns CLAUDE.md et push vers remote
- `build` → Lance npm run build + vérification erreurs + rapport de performance + validation MVP
- `c7` → Commençons la prochaine étape recommandée avec recherche Context7 + génération NEXT_STEP.md
- `nl` → [saut de ligne]
- `mvp` → Respecte architecture MVP 13 tables
- `i18n` → Support FR/EN uniquement (MVP)
- `commit` → Format conventional commits français
- `test` → Lance tests unitaires + tests d'intégration + rapport de couverture + rapport de performance
- `e2e` → Lance tests E2E + rapport de couverture + rapport de performance
- `tdd` → Lance tests TDD + rapport de couverture + rapport de performance
- `all` → Lance tests unitaires + tests d'intégration + tests E2E + rapport de couverture + rapport de performance
- `security` → Lance une analyse de sécurité avec l'agent dédié
- `archi` → Vérifie via le sous-agent dédié l'absence de doublons “fonctionnels” : même composant/service ne doit pas exister à 2 endroits différents (hors ré-exports)
- `typo` → Vérifie cohérence typographique avec le guide typographique HerbisVeritas

## Raccourcis Clavier Système

**Windows + R** → Exécuter → Taper shortcut → Entrer

**AutoHotkey suggestions :**
```autohotkey
; Ctrl+Alt+C → Consulte CLAUDE.md
^!c::
Send, Consulte CLAUDE.md et applique les patterns définis
return

; Ctrl+Alt+N → Nouvelle ligne
^!n::
Send, {Shift down}{Enter}{Shift up}
return
```

---
**Recommandation :** Utilise `cc` dans ton terminal avant de lancer Claude Code, puis copie la sortie.