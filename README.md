# AWS SAA Exam Lab

Simulateur local pour preparer l'examen AWS Certified Solutions Architect Associate (SAA-C03).

L'application importe le contenu du dossier `AWS-Certified-Solutions-Architect-Associate-SAA-C03-Exam-Dump-With-Solution`, construit une base SQLite locale, puis permet de lancer des examens blancs de 65 questions dans une interface web Next.js.

## Fonctionnalites

- Base SQLite locale avec questions, options, bonnes reponses et explications.
- `684` questions importees.
- `86` questions a reponses multiples.
- `54` explications reconstruites manuellement ou completees quand la source etait incomplete.
- Mode `Timed` avec `65` questions et `2 h 10 min`.
- Mode `Review` sans chrono avec correction immediate.
- Score final calcule sur `1000`.

## Prerequis

- Node.js recent
- npm
- Python 3

## Installation

```bash
npm install
```

## Lancer le projet

```bash
npm run dev
```

Le script `predev` regenere la base SQLite si necessaire avant de demarrer Next.js.

Application disponible sur [http://localhost:3000](http://localhost:3000).

## Regenerer la base

```bash
npm run db:seed
```

La base est creee dans `data/aws-saa.sqlite`.

## Build de production

```bash
npm run build
npm run start
```

Le script `prebuild` regenere aussi la base avant le build.

## Structure utile

- `scripts/build_exam_db.py` : parsing des sources PDF/TXT et generation SQLite.
- `data/aws-saa.sqlite` : base de donnees locale.
- `src/app/page.tsx` : page d'accueil.
- `src/app/exam/[sessionId]/page.tsx` : page de session d'examen.
- `src/components/exam-runner.tsx` : logique client du passage d'examen.
- `.planning/vision.md` : vision produit.
- `.planning/todo.md` : suivi de l'avancement.

## Notes sur les donnees

- Le corpus source contient du texte parfois incomplet ou mal extrait depuis le PDF.
- Quelques reponses et explications ont ete reconstruites pour garder une base exploitable.
- Le seed est idempotent : s'il n'y a pas de changement source, il ne reconstruit pas la base inutilement.
