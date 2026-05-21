---
name: cheatsheet-to-flashcards
description: |
  Découpe une cheatsheet AWS (contenu lu depuis la DB du projet) en un deck de
  flashcards atomiques et les insère directement en base via
  scripts/import-flashcards.mjs. Mode replace par cheatsheet (DELETE puis INSERT
  du deck entier). Utilise ce skill quand l'utilisateur dit "génère des flashcards",
  "découpe cette cheatsheet en flashcards", "transforme la fiche X en cartes",
  "/cheatsheet-to-flashcards", ou fournit un slug / titre de cheatsheet.
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

# Cheatsheet → Flashcards (direct DB)

Transforme une cheatsheet (contenu en DB) en deck de flashcards et **les insère
directement en base**. Pas de fichier JSON persistant — le contenu est piped vers
le script d'import qui réécrit le deck pour la cheatsheet ciblée (DELETE + INSERT
atomique).

## ⚠️ Source de vérité = DB, **pas** les `.md`

Les fichiers `cheatsheet/*.md` du repo sont **obsolètes** (vieille version, pas
toujours synchronisée). Le contenu à jour est dans la table `cheatsheets`,
colonne `content`. **Ne lis jamais les `.md` directement** — extrais toujours
depuis la DB.

## Pré-requis

- Le script `scripts/import-flashcards.mjs` doit exister (sinon préviens et stoppe).
- Le script `scripts/dump-cheatsheets.mjs` doit exister (dump DB → JSON dans `/tmp`).
- La table `flashcards` doit exister (auto-créée par le script d'import si absente).
- `.env.local` doit contenir `TURSO_DATABASE_URL` (et `TURSO_AUTH_TOKEN` si remote).

Avant de générer, vérifie en une passe :

```bash
test -f scripts/import-flashcards.mjs && test -f scripts/dump-cheatsheets.mjs && test -f .env.local && echo OK || echo MISSING
```

Si quelque chose manque, stoppe et explique.

## Inputs

- Slug DB (ex. `s3`, `ec2-auto-scaling`, `caching-strategies`) OU titre approchant.
- `--dry-run` : génère + affiche résumé sans insérer.
- `--all` : traite toutes les cheatsheets de la DB séquentiellement.

Si nom seul, résous le slug via une query DB (voir Flow §1).

## Flow par cheatsheet

### 1. Récupère le contenu depuis la DB

Deux options, choisis selon le contexte :

**Option A — dump global (recommandé pour batch / multi-agents)** : lance une fois
`node scripts/dump-cheatsheets.mjs`. Ça écrit un JSON par slug dans
`/tmp/cheatsheet-inputs/<slug>.json` avec les champs `slug, title, category,
domains, priority, existing_content`. Ensuite chaque traitement lit le JSON local.

**Option B — query ciblée (pour 1 fiche)** :

```bash
node -e "
import('./scripts/_db-helpers.mjs').then(async m => {
  const c = m.makeClient();
  const r = await c.execute({sql:'SELECT slug, title, content FROM cheatsheets WHERE slug = ?', args:['<SLUG>']});
  console.log(JSON.stringify(r.rows[0]));
});
"
```

Si l'input est un titre approchant, fais d'abord une recherche `LIKE` :

```bash
node -e "
import('./scripts/_db-helpers.mjs').then(async m => {
  const c = m.makeClient();
  const r = await c.execute({sql:'SELECT slug, title FROM cheatsheets WHERE title LIKE ? OR slug LIKE ?', args:['%<hint>%','%<hint>%']});
  console.log(JSON.stringify(r.rows, null, 2));
});
"
```

S'il y a ambiguïté, liste les matches et demande.

### 2. Génère les cartes

Suis la méthode ci-dessous. **Ne lis pas** le `.md` du repo — il peut diverger.

### 3. Pipe vers le script d'import

```bash
cd "<repo>" && node scripts/import-flashcards.mjs --slug=<slug> <<'CARDS_JSON'
[
  {"position":1,"question":"…","answer":"…","hint":null},
  ...
]
CARDS_JSON
```

Ajoute `--dry-run` si demandé. Le script garantit l'atomicité : `DELETE FROM
flashcards WHERE cheatsheet_id=?` puis ré-insère en transaction. Re-lancer =
remplacer le deck (pas de duplication).

### 4. Affiche le résumé

Renvoie au user :
- Le retour du script (nb cartes insérées, slug, id).
- 3 exemples de cartes (1 facile, 1 use-case, 1 piège).
- Si pertinent, la couverture par section.

## Méthode de découpage (ordre d'importance)

Vise **20–50 cartes** par fiche selon la densité (jamais < 12). Élimine
trivial/redondant.

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
    "position": 1,
    "question": "markdown court ≤ 280c",
    "answer":   "markdown court ≤ 600c",
    "hint":     null
  }
]
```

**Champs persistés** : `position`, `question`, `answer`, `hint`. C'est tout.

Règles strictes :
- Pas de titres `#`, pas de listes imbriquées. Gras/italique/code inline OK.
- `position` part de 1, contiguë, ordre = ordre de génération (sections 1→6).
- `hint` : `null` sauf si la question est ambiguë sans contexte additionnel.
- **N'ajoute pas de champ `tags`, `source`, `category` ou autre** — le script
  les ignore silencieusement, c'est du bruit qui coûte des tokens à générer.
- Le script force `source='generated'` côté DB.

## Mode `--dry-run`

Le script écrit en stdout le SQL qu'il aurait exécuté + le nombre de cartes, sans
toucher la DB. À utiliser pour valider une fiche avant de lancer le batch `--all`.

## Mode batch (`--all`)

1. Lance `node scripts/dump-cheatsheets.mjs` une seule fois (dump global).
2. List les slugs : `ls /tmp/cheatsheet-inputs/*.json`.
3. **Demande confirmation** avant de lancer (nb cheatsheets, estim. cartes totales).
4. Traite séquentiellement ou délègue à des sous-agents (un par cheatsheet) :
   ```
   [12/54] caching-strategies → 50 cartes ✓
   ```
5. À la fin, résume : total cartes, fiches sous le seuil (< 12) à revoir manuellement,
   éventuelles erreurs de résolution de slug.

Stoppe au premier échec DB. Pour les échecs de slug (cheatsheet absente en DB), skip
et log — ne fais pas tout planter.

### Délégation multi-agents (recommandé pour `--all`)

Pour un batch important (> 5 fiches), il est plus efficace de **lancer un sous-agent
Opus par cheatsheet** en parallèle. Chaque sous-agent reçoit :
- son slug et le chemin `/tmp/cheatsheet-inputs/<slug>.json`
- les RÈGLES de découpage de ce skill
- la commande d'import à exécuter via heredoc

L'agent fait : lecture du JSON → génération → import → rapport.

## Procédure résumée

1. Vérif `import-flashcards.mjs` + `dump-cheatsheets.mjs` + `.env.local`.
2. Résous le(s) slug(s) cible(s) via DB query.
3. Pour chaque fiche : lis depuis DB (option A ou B) → génère cartes (mental, pas
   de fichier intermédiaire) → Bash heredoc vers le script d'import.
4. Affiche résumé + exemples.

## Garde-fous

- Contenu DB < 1500 caractères ou narrative → préviens, propose de skip.
- Tableau markdown malformé → parse manuel, ne produit pas de cartes vides.
- N'invente **rien** : info absente du contenu DB = pas de carte. Pas de
  connaissances AWS externes.
- Si le script renvoie un code de sortie non-zéro, affiche stderr brut au user, ne
  retente pas en boucle.
- **Ne lis jamais les `cheatsheet/*.md`** du repo : ils sont obsolètes.
