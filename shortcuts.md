# Claude Code Shortcuts

## Terminal Shortcuts Configurés

### Aliases Bash
```bash
# Dans ton terminal (avant Claude Code)
cc        # → "Consulte CLAUDE.md et applique les patterns définis"
dp        # → "Consulte docs/DEVELOPMENT_PLAN_MVP.md et indique où nous en sommes"
orthodox  # → "Vérifie cohérence entre docs/DEVELOPMENT_PLAN_MVP.md, docs/DATABASE_SCHEMA_MVP.md et architecture 13 tables"
github    # → "Analyse pending changes, commit selon patterns CLAUDE.md et push vers remote"
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
- `orthodox` → Vérifie cohérence entre docs/DEVELOPMENT_PLAN_MVP.md, docs/DATABASE_SCHEMA_MVP.md et architecture 13 tables
- `github` → Analyse pending changes, commit selon patterns CLAUDE.md et push vers remote
- `nl` → [saut de ligne]
- `mvp` → Respecte architecture MVP 13 tables
- `i18n` → Support FR/EN uniquement (MVP)
- `commit` → Format conventional commits français

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