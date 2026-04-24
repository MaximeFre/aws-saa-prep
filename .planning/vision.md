# Vision

## Produit

Construire une application Next.js simple, fiable et agréable pour simuler l'examen AWS Certified Solutions Architect Associate (SAA-C03) a partir d'une base locale SQLite alimentee par les sources du projet.

## Objectif principal

Permettre a l'utilisateur de lancer rapidement un examen blanc de 65 questions, dans des conditions proches du vrai format AWS, avec un rendu clair, un suivi de progression et un score final sur 1000.

## Experience cible

- Demarrage rapide depuis la page d'accueil.
- Deux modes distincts :
  - `Timed` : 65 questions, 2 h 10 min, correction a la fin.
  - `Review` : 65 questions, sans limite de temps, explication immediate apres chaque reponse.
- Interface sobre, lisible et rassurante, adaptee desktop et mobile.
- Sessions locales simples a relancer sans dependance externe.

## Donnees

- Toutes les questions, reponses, bonnes reponses et explications doivent vivre dans SQLite.
- La base doit etre regenerable a partir des fichiers source du dossier AWS-Certified....
- Les cas incomplets ou mal extraits doivent etre documentes et geres explicitement.

## Contraintes

- Pas de service externe obligatoire.
- Build local simple avec `npm install` puis `npm run dev`.
- Base regeneree automatiquement avant `dev` et `build`.

## Definition de done

- La base SQLite contient l'ensemble du corpus exploitable.
- L'utilisateur peut lancer un examen en mode `Timed` ou `Review`.
- Le calcul du score final sur 1000 fonctionne.
- Les explications s'affichent au bon moment selon le mode.
- L'application build et passe le lint.
