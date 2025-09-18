# Personnage adaptable pour SillyTavern

Cette extension ajoute un tiroir « Personnage adaptable » dans le panneau des extensions de SillyTavern. Elle permet de décrire précisément tes besoins (mission, approche, ton, exemples de dialogue…) puis de générer une carte complète gérée par l’extension.

La fiche est sauvegardée/actualisée via l’API de SillyTavern, verrouillée contre la suppression accidentelle et peut, au besoin, connecter automatiquement l’API et le modèle/preset que tu indiques.

## Fonctionnalités
- Formulaire complet pour définir le rôle, les besoins, l’approche, le ton et les exemples de dialogue du personnage.
- Sauvegarde ou mise à jour d’une carte unique marquée par l’extension, avec suivi automatique dans la liste des personnages.
- Verrouillage : toute tentative de suppression côté client est bloquée et signalée.
- Option pour sélectionner automatiquement le personnage créé/mis à jour.
- Option pour déclencher les commandes `/api` et `/model` (slash commands natives) afin de connecter l’API et le modèle voulus dès que le personnage est sélectionné.
- Aperçu synthétique en temps réel des informations saisies.

## Installation
1. Copie ce dossier dans `public/scripts/extensions` (ou ton répertoire d’extensions externes) de SillyTavern.
2. Redémarre SillyTavern ou recharge la liste des extensions.
3. Active « Personnage adaptable » depuis le menu **Extensions**.

## Utilisation
1. Ouvre le panneau **Extensions** puis déroule « Personnage adaptable ».
2. Renseigne les champs : mission, approche, ton, exemples, tags et, si besoin, API/modèle.
3. (Facultatif) Coche les options « Sélectionner automatiquement… » et « Connecter automatiquement… » selon ton flux de travail.
4. Clique sur **Sauvegarder la carte adaptée** pour créer ou mettre à jour la fiche persistante.
5. Utilise **Sélectionner dans la liste** pour te placer dessus à tout moment.

## Notes
- La carte générée est identifiée par une signature interne ; l’extension la retrouve même après redémarrage et met à jour ses champs.
- Le verrouillage empêche la suppression via l’interface standard. Pour retirer définitivement le personnage, désactive ou supprime l’extension puis efface la carte manuellement.
- La connexion au modèle repose sur les slash commands `/api` et `/model`. Vérifie que les valeurs saisies correspondent aux options disponibles dans ton instance SillyTavern.
