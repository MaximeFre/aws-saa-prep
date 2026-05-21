---
name: cheatsheet-to-flashcards
description: |
  Découpe une cheatsheet AWS (markdown du dossier cheatsheet/) en un deck de flashcards
  atomiques et les insère directement dans la base via scripts/import-flashcards.mjs.
  Mode replace par cheatsheet (DELETE puis INSERT du deck entier). Utilise ce skill
  quand l'utilisateur dit "génère des flashcards", "découpe cette cheatsheet en
  flashcards", "transforme la fiche X en cartes", "/cheatsheet-to-flashcards", ou
  fournit un chemin vers un .md du dossier cheatsheet/.
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

# Cheatsheet → Flashcards (direct DB)

Transforme une fiche markdown en deck de flashcards et **les insère directement en
base**. Pas de fichier JSON persistant — le contenu est piped vers le script d'import
qui réécrit le deck pour la cheatsheet ciblée (DELETE + INSERT atomique).

## Pré-requis

- Le script `scripts/import-flashcards.mjs` doit exister (sinon préviens et stoppe).
- La table `flashcards` doit exister en DB (migration auto via `ensureMigrations()`).
- `.env.local` doit contenir `TURSO_DATABASE_URL` (et `TURSO_AUTH_TOKEN` si remote).

Avant de générer quoi que ce soit, **vérifie ces 2 fichiers en une passe Bash** :

```bash
test -f scripts/import-flashcards.mjs && echo OK_SCRIPT || echo MISSING_SCRIPT
test -f .env.local && echo OK_ENV || echo MISSING_ENV
```

Si l'un manque, arrête, dis-le clairement, propose de coder le script en premier.

## Inputs

- Chemin vers `cheatsheet/*.md` OU nom de service (ex. "S3", "EC2 Auto Scaling").
  Si nom seul, fais un `Glob cheatsheet/<Nom>*.md` pour résoudre. S'il y a ambiguïté,
  liste les matches et demande.
- `--dry-run` : génère + affiche le résumé mais n'insère pas (pour piloter le format).
- `--all` : traite toutes les fiches de `cheatsheet/*.md` séquentiellement.

## Flow par fiche

1. **Lis** le .md (`Read`).
2. **Extrais** :
   - `title` = première ligne `# <Nom>`
   - `slug` = slug du title (lowercase, non-alphanum → tiret). Doit matcher le `slug`
     en DB (table `cheatsheets`). Si doute, fais une requête de vérif :
     ```bash
     node -e "import('@libsql/client').then(async m=>{const c=m.createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});const r=await c.execute({sql:'SELECT slug,title FROM cheatsheets WHERE slug LIKE ?',args:['%<hint>%']});console.log(r.rows)})" 2>&1
     ```
     Ou plus simple : laisse le script d'import faire la résolution et erreur si pas
     trouvé.
3. **Génère** les cartes en suivant la méthode ci-dessous.
4. **Pipe** vers le script via heredoc :
   ```bash
   node scripts/import-flashcards.mjs --slug=<slug> <<'CARDS_JSON'
   [
     {"position":1,"question":"…","answer":"…","hint":null,"tags":["s3"]},
     ...
   ]
   CARDS_JSON
   ```
   Ajoute `--dry-run` si demandé.
5. **Affiche** au user le résumé renvoyé par le script (nb cartes insérées,
   slug, ID cheatsheet) + 3 exemples (1 facile, 1 use-case, 1 piège).

Le script garantit l'atomicité : il `DELETE FROM flashcards WHERE cheatsheet_id=?`
puis ré-insère le deck dans une seule transaction. Re-lancer le skill = remplacer le
deck (pas de duplication).

## Méthode de découpage (ordre d'importance)

Vise **20–40 cartes** par fiche (jamais < 12, jamais > 50). Élimine trivial/redondant.

### 1. Définition / purpose (1–2 cartes)

À partir de la section "Purpose" / intro :
- Q: "Qu'est-ce que <service> ?" → A: phrase de définition + cas d'usage principal.
- Q: "Quel problème <service> résout-il ?" si pertinent.

### 2. Tableau "Key Features" (1 carte par ligne)

Chaque ligne Feature/Description :
- **Recto = Description** (sans nommer la feature), **Verso = Feature**.
  Q: "Quelle fonctionnalité S3 garde plusieurs versions d'un objet pour rollback ?"
  → A: "**Versioning**."
- OU l'inverse si la feature seule est un terme à mémoriser :
  Q: "À quoi sert la **Cross-Region Replication (CRR)** ?" → A: réplication async vers
  une autre Region (requiert versioning).

Choisis le sens qui force le rappel le plus utile (scénario → nom du concept est
souvent meilleur).

### 3. Tableau "Common Exam Use Cases" (1 carte par ligne)

**Le plus important** — patterns d'examen.
- Q = scénario brut. A = solution recommandée + 1 phrase d'explication si non évidente.
- Ex: Q: "Comment respecter une politique WORM sur S3 ?" → A: "**Object Lock** en mode
  *Governance* ou *Compliance*."

### 4. Sécurité / Pricing / Integration

- Sécurité : 1 carte par mécanisme distinct (ou 1 carte de comparaison si 3-4 variantes
  s'opposent).
- Pricing : 1–3 cartes sur les axes de coût (storage class, transfer out, requests).
- Integration : grouper "Avec quels services <X> s'intègre-t-il pour Y ?" plutôt qu'une
  carte par flèche.

### 5. Exam Tips (1 carte par puce ✅)

Q: "S3 est-il un stockage objet, bloc ou fichier ?" → A: "**Objet** (EBS = bloc,
EFS = fichier)."

### 6. Real-World Example (1–2 cartes)

Q: scénario condensé. A: stack recommandée en bullets courts.

## Heuristiques de qualité

- **Un seul concept par carte.** "et" dans la question = soupçon de split.
- **Question fermée**, réponse unique. "Quel/Quand/Comment/Combien" plutôt que
  "Décrivez…".
- **Pas de yes/no** sauf piège mémorable.
- **Cloze** quand un terme isolé est l'info clé : Q: "S3 atteint **___** nines de
  durabilité." → A: "11".
- **Pas de contexte implicite** : "Que recommande-t-on ici ?" ❌ →
  "…pour archiver des données rarement accédées sur S3 ?" ✅.
- Comparaisons opposées (Standard-IA vs One Zone-IA) : 1 carte par sens + 1 carte de
  comparaison (3 max).

## Contrat JSON envoyé au script

```json
[
  {
    "position": 1,                       // int, base 1, contigu
    "question": "markdown court ≤ 280c",
    "answer":   "markdown court ≤ 600c",
    "hint":     null,                    // string ou null
    "tags":     ["s3", "lifecycle"]      // 1-3 tags, en fr, lowercase
  }
]
```

Règles strictes :
- Pas de titres `#`, pas de listes imbriquées. Gras/italique/code OK.
- `position` part de 1, contiguë, ordre = ordre de génération (sections 1→6).
- `tags` : 1–3, lowercase. Non persistés en V1 mais utiles à l'audit.
- Pas de `source` côté payload — le script force `source='generated'`.

## Mode `--dry-run`

Le script écrit en stdout le SQL qu'il aurait exécuté + le nombre de cartes, sans
toucher la DB. À utiliser pour valider une fiche avant de lancer le batch `--all`.

## Mode batch (`--all`)

1. `Glob cheatsheet/*.md` → liste.
2. **Demande confirmation** avant de lancer (montre nb fiches, estim. cartes totales).
3. Traite séquentiellement :
   ```
   [12/54] EC2.md → résolu slug=ec2 → 28 cartes insérées ✓
   ```
4. À la fin, résume : total cartes, fiches sous le seuil (< 12) à revoir manuellement,
   éventuelles erreurs de résolution de slug.

Stoppe au premier échec DB. Pour les échecs de slug (cheatsheet absente en DB), skip
et log — ne fais pas tout planter.

## Procédure résumée (un seul tour si possible)

1. Vérif `import-flashcards.mjs` + `.env.local`.
2. Résous le(s) fichier(s) cible(s).
3. Pour chaque fiche : Read .md → génère cartes (mental, pas de fichier intermédiaire)
   → Bash heredoc vers le script.
4. Affiche résumé + exemples.

## Garde-fous

- Fiche < 1500 caractères ou narrative → préviens, propose de skip.
- Tableau markdown malformé → parse manuel, ne produit pas de cartes vides.
- N'invente **rien** : info absente de la fiche = pas de carte. Pas de connaissances
  AWS externes.
- Si le script renvoie un code de sortie non-zéro, affiche stderr brut au user, ne
  retente pas en boucle.
