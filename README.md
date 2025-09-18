# Créateur de personnages aléatoires pour SillyTavern

Cette extension ajoute un tiroir dans le panneau des extensions de SillyTavern contenant un bouton « Créer un personnage aléatoire ». Un profil complet (description, personnalité, scénario, salutations, exemples de dialogue…) est généré à partir d'une banque de descriptions narratives poétiques, puis sauvegardé automatiquement via l'API de SillyTavern.

## Fonctionnalités
- Génération instantanée d'un personnage inédit avec nom, description, personnalité, scénario, exemples de dialogues et notes de créateur.
- Prévisualisation textuelle du profil créé directement dans l'interface de l'extension.
- Option pour sélectionner automatiquement le personnage fraîchement généré.
- Deux salutations alternatives créées aléatoirement pour varier les introductions.

## Installation
1. Cloner ou télécharger ce dépôt dans le dossier `public/scripts/extensions` de SillyTavern (ou dans le répertoire où vous stockez vos extensions externes).
2. Redémarrer SillyTavern ou recharger la liste des extensions.
3. Activer l'extension « Créateur de personnages aléatoires » depuis le menu **Extensions**.

## Utilisation
1. Ouvrez le panneau **Extensions** dans SillyTavern puis déroulez la section « Générateur narratif aléatoire ».
2. Cochez l'option « Sélectionner automatiquement le personnage créé » si vous souhaitez que la fiche générée devienne immédiatement le personnage actif.
3. Cliquez sur **Créer un personnage aléatoire**.
4. Quelques secondes plus tard, la fiche est enregistrée ; le résumé apparaît dans l'encadré « Dernière génération » et un toast confirme la création.

## Remarques
- Les personnages sont générés uniquement à partir d'un corpus local de descriptions et de tonalités narratives ; aucun appel à un service externe n'est effectué.
- Les fiches sont sauvegardées en respectant le format TavernCard v2 utilisé par SillyTavern.
- Si la création échoue (par exemple si le serveur n'est pas accessible), un message d'erreur s'affiche dans l'application et la console navigateur fournit plus de détails.
