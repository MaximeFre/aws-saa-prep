# Data Quality

## Etat actuel

- Base SQLite construite avec `684` questions.
- `86` questions sont en mode multi-reponses.
- `54` questions utilisent une explication ou une reponse reconstruite.

## Pourquoi ce document

Les sources locales PDF/TXT sont globalement exploitables, mais certaines portions sont mal extraites, tronquees ou incoherentes. Le seed gere ces cas avec des corrections manuelles pour garder une base utilisable dans l'application.

## Questions avec correction manuelle

Questions source actuellement surcharges ou reconstruites dans `scripts/build_exam_db.py` :

`36, 80, 96, 112, 167, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 207, 210, 219, 224, 235, 248, 250, 253, 257, 272, 283, 297, 298, 308, 311, 315, 327, 341, 366, 390, 402, 414, 417, 423, 429, 434, 477, 491, 494, 528, 539, 543, 563, 569, 581, 599, 608, 638, 672`

## Points les plus sensibles a revalider

- `366` : reponse manuelle inferee.
- `390` : question multi-reponses reconstruite.
- `599` : question multi-reponses avec combinaison `A, C, F`.
- `638` : reponse manuelle inferee.
- `477` : options reconstruites manuellement car l'extraction etait defectueuse.

## Echantillon des sujets concernes

- `36` : chiffrement multi-Region sur Amazon S3.
- `112` : migration d'une application web conteneurisee vers AWS.
- `224` : haute disponibilite d'une application web sur EC2.
- `235` : migration Oracle vers Aurora PostgreSQL.
- `283` : partage de fichiers Linux + Windows.
- `341` : S3 data lake, Lake Formation et QuickSight.
- `402` : ingestion de streaming data.
- `491` : validation asynchrone de donnees carte bancaire.
- `599` : architecture payment processing avec ECS et RDS.
- `672` : analyse clickstream dans Amazon S3.

## Recommendation

Avant d'utiliser cette base comme reference definitive, faire une passe de validation sur les questions sensibles ci-dessus avec la documentation AWS officielle ou une banque de questions mieux structuree.
