# PLAN_REFACTOR_MAIN

## Objectif
Refactoriser la branche `main` **sans changer le rendu ni le comportement** afin d'obtenir une base propre, lisible et stable avant une future migration shader.

## Important
Cette branche **ne doit pas** :
- changer le rendu
- changer les timings
- changer le tracking
- changer le blink
- changer le fall / squash
- introduire un shader
- introduire Tweakpane

Le projet actuel utilise des **inputs HTML simples**, et c'est très bien. Il faut les conserver pendant toute la refacto.

## Nom de branche conseillé

```bash
git checkout main
git checkout -b refactor-main-foundation
```

## Règles globales pour l'agent
1. Une seule étape par commit.
2. Aucun changement de rendu volontaire.
3. Aucun changement de comportement volontaire.
4. Ne pas optimiser "au passage".
5. Ne pas réécrire les effets "plus proprement".
6. Validation manuelle obligatoire entre chaque étape.
7. Les inputs HTML existants doivent rester fonctionnels à chaque étape.
8. `main.ts` doit progressivement devenir un simple orchestrateur.
9. Cette branche prépare la migration shader, elle ne la fait pas.

## Structure cible

```text
src/
  main.ts

  app/
    create-app.ts
    create-stage.ts
    resize-stage.ts

  debug/
    create-controls.ts
    debug-state.ts

  shared/
    math.ts
    color.ts
    constants.ts
    types.ts

  eye/
    eye-types.ts
    eye-config.ts
    eye-state.ts
    eye-assets.ts
    eye-factory.ts
    eye-controller.ts
    eye-field.ts

    tracking/
      mouse-tracking.ts

    behaviors/
      eye-tracking.ts
      eye-floating.ts
      eye-blink.ts
      eye-fall.ts

    render/
      human-eye-view.ts
      cat-eye-view.ts
      eye-layer-utils.ts
```

## Vision de la branche
Le but est de conserver le projet actuel comme **référence visuelle et comportementale**, tout en le découpant en modules clairs :
- bootstrap app
- state debug / controls
- tracking souris
- types
- état des yeux
- assets partagés
- vues humaines / chat
- comportements séparés
- field / controller

Aucune logique ne doit être "améliorée" dans cette branche.

---

## Étape 0 — baseline visuelle

### But
Geler une référence visuelle et comportementale avant toute refacto.

### À faire
- lancer le projet actuel
- capturer :
  - un œil isolé
  - un groupe d'yeux
  - tracking souris
  - blink
  - fall / return si présent
- noter les valeurs des inputs importants

### Livrable
Créer un dossier local de référence, par exemple :
```text
refactor-baseline/
  screenshots/
  notes.md
```

### Validation
Tu confirmes que tu as une référence claire pour comparer après chaque étape.

### Commit
```bash
git commit -m "chore: capture visual baseline for main refactor"
```

---

## Étape 1 — créer l'arborescence cible

### But
Préparer la structure sans déplacer encore de logique.

### À faire
Créer les dossiers :
- `src/app`
- `src/debug`
- `src/shared`
- `src/eye`
- `src/eye/tracking`
- `src/eye/behaviors`
- `src/eye/render`

Créer les fichiers vides :
- `src/app/create-app.ts`
- `src/app/create-stage.ts`
- `src/app/resize-stage.ts`
- `src/debug/create-controls.ts`
- `src/debug/debug-state.ts`
- `src/shared/math.ts`
- `src/shared/color.ts`
- `src/shared/constants.ts`
- `src/shared/types.ts`
- `src/eye/eye-types.ts`
- `src/eye/eye-config.ts`
- `src/eye/eye-state.ts`
- `src/eye/eye-assets.ts`
- `src/eye/eye-factory.ts`
- `src/eye/eye-controller.ts`
- `src/eye/eye-field.ts`
- `src/eye/tracking/mouse-tracking.ts`
- `src/eye/behaviors/eye-tracking.ts`
- `src/eye/behaviors/eye-floating.ts`
- `src/eye/behaviors/eye-blink.ts`
- `src/eye/behaviors/eye-fall.ts`
- `src/eye/render/human-eye-view.ts`
- `src/eye/render/cat-eye-view.ts`
- `src/eye/render/eye-layer-utils.ts`

### Interdit
- déplacer du code
- modifier des imports runtime
- changer le comportement

### Validation
Le projet compile toujours et rien n'a changé visuellement.

### Commit
```bash
git commit -m "chore: scaffold target folder structure"
```

---

## Étape 2 — extraire les utilitaires math

### But
Sortir les helpers purs sans toucher à la logique globale.

### À faire
Déplacer dans `src/shared/math.ts` uniquement les fonctions pures déjà présentes ou implicitement dupliquées :
- `clamp`
- `lerp`
- `smoothTowards`
- `normalizeOrZero`
- `clampMagnitude`
- autres petits helpers numériques purs

### Interdit
- changer les formules
- renommer agressivement
- améliorer le comportement

### Validation
Même rendu, même interactions, même timing.

### Commit
```bash
git commit -m "refactor: extract shared math helpers"
```

---

## Étape 3 — extraire les helpers couleur

### But
Sortir les conversions couleur du code de rendu.

### À faire
Créer `src/shared/color.ts` et y déplacer uniquement :
- conversion `{ r, g, b } -> number`
- autres helpers couleur déjà existants

### Interdit
- changer le format des couleurs
- introduire un nouveau système de thèmes

### Validation
Couleurs identiques visuellement.

### Commit
```bash
git commit -m "refactor: extract shared color helpers"
```

---

## Étape 4 — extraire le state des controls

### But
Isoler la source de vérité des inputs HTML.

### À faire
Déplacer dans `src/debug/debug-state.ts` :
- interfaces / types des réglages
- valeurs par défaut
- persistence locale si elle existe déjà
- fonctions de création / sauvegarde du state si présentes

### Interdit
- changer les valeurs par défaut
- changer les noms de champs
- remplacer les inputs HTML

### Validation
Les inputs affichent les mêmes valeurs et modifient toujours le projet.

### Commit
```bash
git commit -m "refactor: extract debug state"
```

---

## Étape 5 — extraire la création des controls

### But
Sortir la logique des inputs HTML du bootstrap.

### À faire
Créer `src/debug/create-controls.ts` et y déplacer :
- création des inputs
- bindings DOM
- écoute des changements
- sync éventuelle avec le state

### Interdit
- remplacer les controls
- changer l'UX
- ajouter de nouveaux réglages

### Validation
Les inputs HTML fonctionnent exactement comme avant.

### Commit
```bash
git commit -m "refactor: extract html controls setup"
```

---

## Étape 6 — extraire le tracking souris

### But
Avoir une source unique de tracking.

### À faire
Déplacer dans `src/eye/tracking/mouse-tracking.ts` :
- listeners souris / pointer / touch existants
- position courante
- setup du tracking
- getter de position

### Interdit
- changer le type d'événement si ça change le comportement
- ajouter du smoothing
- modifier le contrat de `getMousePosition`

### Validation
Le tracking se comporte pareil qu'avant.

### Commit
```bash
git commit -m "refactor: extract mouse tracking"
```

---

## Étape 7 — extraire les types du domaine œil

### But
Rendre le domaine plus lisible.

### À faire
Déplacer dans `src/eye/eye-types.ts` :
- `EyeKind`
- `EyeConfig`
- `EyeState`
- `EyeView`
- `Eye`
- autres types liés au domaine œil

### Interdit
- refondre le modèle
- supprimer des champs
- "simplifier" les types

### Validation
Le projet compile et se comporte pareil.

### Commit
```bash
git commit -m "refactor: extract eye domain types"
```

---

## Étape 8 — extraire la création du state des yeux

### But
Sortir la logique de création de `EyeState`.

### À faire
Déplacer dans `src/eye/eye-state.ts` :
- `createEyeState`
- `createEyeStates`

### Interdit
- modifier les valeurs initiales
- changer les champs initialisés
- corriger des bugs à ce stade

### Validation
Même comportement au chargement.

### Commit
```bash
git commit -m "refactor: extract eye state creation"
```

---

## Étape 9 — extraire la config des yeux

### But
Sortir les configs de population / layout.

### À faire
Déplacer dans `src/eye/eye-config.ts` :
- count
- layout
- probabilités humain/chat
- configs de position initiale
- constantes de génération

### Interdit
- changer la distribution
- changer la densité
- changer la logique visuelle

### Validation
La scène ressemble à celle de `main`.

### Commit
```bash
git commit -m "refactor: extract eye config and layout"
```

---

## Étape 10 — extraire les assets partagés

### But
Rendre explicite le pipeline d'assets partagés.

### À faire
Déplacer dans `src/eye/eye-assets.ts` :
- génération des textures / assets
- cache des assets
- helpers liés à ces assets

### Interdit
- convertir le système en shader
- changer la nature des assets
- optimiser

### Validation
Le rendu est identique.

### Commit
```bash
git commit -m "refactor: extract shared eye assets"
```

---

## Étape 11 — extraire la vue humaine actuelle

### But
Isoler le rendu humain tel qu'il existe aujourd'hui.

### À faire
Déplacer dans `src/eye/render/human-eye-view.ts` :
- création de la vue humaine
- update visuel
- logique de layering associée

### Interdit
- réécrire le rendu
- corriger les glitches
- remplacer `Graphics` / sprites / masks
- préparer le shader

### Validation
L'œil humain a exactement le même rendu et les mêmes défauts.

### Commit
```bash
git commit -m "refactor: extract current human eye view"
```

---

## Étape 12 — extraire la vue chat actuelle

### But
Même traitement pour l'œil chat.

### À faire
Déplacer dans `src/eye/render/cat-eye-view.ts` :
- création de la vue chat
- update visuel
- logique spécifique chat

### Interdit
- corriger les morphs
- simplifier les paupières
- changer le blink

### Validation
L'œil chat se comporte comme avant.

### Commit
```bash
git commit -m "refactor: extract current cat eye view"
```

---

## Étape 13 — extraire la factory d’yeux

### But
Avoir un point clair de création des instances.

### À faire
Créer `src/eye/eye-factory.ts` et y déplacer :
- création d'une instance complète
- création du container
- choix de la vue selon le type
- lien entre state et vue

### Interdit
- changer le type d'œil généré
- changer les conditions de choix
- optimiser

### Validation
Même rendu et même comportement global.

### Commit
```bash
git commit -m "refactor: extract eye factory"
```

---

## Étape 14 — extraire le field d’yeux

### But
Isoler la gestion de la collection d’yeux.

### À faire
Créer `src/eye/eye-field.ts` et y déplacer :
- création des yeux
- ajout à la scène
- update de la collection

### Interdit
- changer l'ordre d'update
- changer le count
- changer le layout

### Validation
Même scène, même dynamique.

### Commit
```bash
git commit -m "refactor: extract eye field management"
```

---

## Étape 15 — extraire le controller d’un œil

### But
Centraliser l'update d'un œil.

### À faire
Créer `src/eye/eye-controller.ts` et y déplacer :
- orchestration des behaviors
- appel au rendu
- update d'un œil

### Interdit
- changer le comportement
- modifier les calculs

### Validation
Tracking, blink, floating, fall : identiques.

### Commit
```bash
git commit -m "refactor: extract eye controller"
```

---

## Étape 16 — extraire le behavior tracking

### But
Isoler la logique de tracking d’un œil.

### À faire
Déplacer dans `src/eye/behaviors/eye-tracking.ts` :
- calculs liés au regard
- offsets
- clamp
- éventuels helpers de tracking déjà existants

### Interdit
- changer le contrat des données
- améliorer le tracking
- corriger le squeeze

### Validation
Le tracking reste identique.

### Commit
```bash
git commit -m "refactor: extract eye tracking behavior"
```

---

## Étape 17 — extraire le behavior floating

### But
Isoler le flottement.

### À faire
Déplacer dans `src/eye/behaviors/eye-floating.ts` :
- phase flottante
- offsets de drift
- rotation légère si existante

### Interdit
- changer le mouvement
- lisser autrement

### Validation
Le flottement est identique.

### Commit
```bash
git commit -m "refactor: extract eye floating behavior"
```

---

## Étape 18 — extraire le behavior blink

### But
Isoler le blink.

### À faire
Déplacer dans `src/eye/behaviors/eye-blink.ts` :
- état de blink
- progression
- déclenchement
- logique spécifique si déjà présente

### Interdit
- changer le blink
- refaire les courbes
- corriger le chat

### Validation
Le blink reste identique.

### Commit
```bash
git commit -m "refactor: extract eye blink behavior"
```

---

## Étape 19 — extraire le behavior fall

### But
Isoler la logique de chute / retour.

### À faire
Déplacer dans `src/eye/behaviors/eye-fall.ts` :
- fall state
- squash global
- rebond
- retour

### Interdit
- modifier l'effet
- ajuster les timings
- corriger la physique

### Validation
La chute / le retour sont identiques.

### Commit
```bash
git commit -m "refactor: extract eye fall behavior"
```

---

## Étape 20 — réduire `main.ts`

### But
Faire de `main.ts` un simple point d'entrée.

### `main.ts` doit seulement
- créer l'app
- créer le state debug
- créer les controls
- setup le tracking souris
- créer le field
- brancher le ticker
- brancher le resize

### Interdit
- logique métier dans `main.ts`
- rendu spécifique dans `main.ts`
- création détaillée des yeux dans `main.ts`

### Validation
`main.ts` devient court et lisible, sans changement visuel.

### Commit
```bash
git commit -m "refactor: reduce main entrypoint to orchestration"
```

---

## Étape 21 — nettoyage final léger

### But
Finir la branche sans changement fonctionnel.

### À faire
- supprimer imports morts
- supprimer duplications triviales
- harmoniser quelques noms locaux seulement si nécessaire
- vérifier typecheck / lint / build

### Interdit
- modifier des comportements
- toucher au rendu
- introduire une optimisation

### Validation
Même rendu, même interactions, code plus lisible.

### Commit
```bash
git commit -m "chore: finalize refactor foundation cleanup"
```

---

## Checklist finale de validation
- [ ] même rendu que `main`
- [ ] mêmes controls HTML
- [ ] même tracking
- [ ] même blink
- [ ] même fall / squash
- [ ] `main.ts` court
- [ ] comportements séparés
- [ ] vues séparées
- [ ] state et tracking séparés
- [ ] aucune migration shader encore

## Branche suivante
Une fois cette branche validée :

```bash
git checkout refactor-main-foundation
git checkout -b shader-eye-v1
```

---

# Instructions à donner à l'agent

Tu peux lui donner ceci tel quel :

## Mission
Tu travailles sur une branche de refacto structurelle de `main`, sans changement de rendu ni de comportement.

## Contraintes absolues
- Une seule étape à la fois.
- Un seul commit par étape.
- Tu attends ma validation entre chaque étape.
- Tu ne modifies pas volontairement le rendu.
- Tu ne modifies pas volontairement le comportement.
- Tu ne remplaces pas les inputs HTML par Tweakpane.
- Tu ne prépares pas encore le shader.
- Tu ne réécris pas les effets "plus proprement".
- Tu ne profites pas d'une étape pour faire une optimisation.
- Tu ne fusionnes jamais deux étapes.

## Priorité
Le projet doit rester fonctionnel à chaque étape :
- build OK
- rendu identique
- interactions identiques
- controls HTML identiques

## Méthode de réponse attendue
À chaque étape :
1. tu indiques exactement quels fichiers tu modifies
2. tu expliques brièvement ce que tu déplaces
3. tu fais le changement minimal
4. tu me demandes validation avant de continuer

## Rappel
Cette branche sert uniquement à obtenir une fondation propre avant une future branche shader.
