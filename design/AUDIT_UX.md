# Audit UX/UI — GymLog (12 juillet 2026)

Audit par lecture de code de tous les écrans, préalable au redesign.
Objectif d'Enzo : **plus belle visuellement ET plus pratique** (UX, pas que
cosmétique). Les trois directions visuelles qui en découlent sont maquettées
sur `/design` (v1 L'Affiche, v2 L'Instrument, v3 Le Club).

## Le diagnostic en une phrase

L'app est fonctionnellement riche mais visuellement **monotone** (tout est
violet-sur-noir glassmorphism avec glow — l'esthétique « app IA générique »)
et son écran le plus important — la séance en cours — **ne suit pas ce que
l'utilisateur fait réellement** (aucune notion de série accomplie, pas de
durée, pas de volume en direct).

## Les 7 problèmes majeurs (par impact)

### 1. Pas de suivi de séance en direct — LogScreen
`components/screens/LogScreen.tsx` : les séries n'ont pas d'état « faite »
(`types` : `{weight, reps}` seulement). Le bouton ✓ (`SetRow`, ligne 292)
lance le repos mais ne marque rien. Conséquences : pas de progression
visible pendant la séance, pas de durée, pas de volume cumulé, le bouton
« Enregistrer » tout en bas est le seul feedback de fin. **C'est le cœur du
métier de l'app et c'est là qu'elle est la plus faible.** Les 3 maquettes
introduisent : séries cochables, barre de session collante (durée · volume ·
séries n/m), repos rattaché à la série cochée.

### 2. L'accueil est un débarras — HomeScreen
9 blocs empilés sans hiérarchie : héros, dernière séance, semaine, CTA Pro,
programmes, classement, hydratation, **réglage de notifications** (doublonné
dans le menu profil d'AppShell), suggestion IA. L'action n° 1 (démarrer la
séance suggérée) est le **dernier** bloc, à 2 000 px du haut. `alert()` natif
ligne 45. Les maquettes recentrent : prochaine séance + CTA en premier,
semaine, dernière séance — le reste part dans des écrans dédiés.

### 3. Contraste sous le seuil, systématique (toute l'app)
`text-zinc-600` (~2,6:1) et `text-zinc-700` (~1,9:1) portent du contenu
informatif partout : ProgressScreen 208/352/412, HistoryScreen 259-266
(métadonnées illisibles), CardsScreen 75/90/92 (la progression, cœur de
l'écran), ProgramsSheet 177/235, ProScreen 213/439. La charte (§3) l'interdit.
**Fix global : contenu à `text-zinc-400` minimum.**

### 4. Cibles tactiles < 44 px sur les actions principales
Chips de filtre (Progress 450, Cards 106, AISession 58 : ~28-32 px), toggles
switch 24 px (AICoach 207, Leaderboard 288, AppShell 403/421), boutons
« Démarrer » minHeight 36 (Programs 204), champs CVV/expiry ~24 px sur le
paiement (Pro 313), bouton aide 16 px (Measurements 408).

### 5. Dérive du design system
- **strokeWidth** : 1.5, 1.6, 1.8, 2, 2.4, 2.5 cohabitent (Measurements 2.4,
  Cards 1.6, Stretching 1.5).
- **Couleurs hors tokens** : deux ors concurrents (#FBBF24 vs #F1C40F),
  violets non listés dans ProScreen (#3B0764, #5B21B6, #1E0B3D).
- **Emojis-icônes** interdits par la charte : 🥇🥈🥉 (Leaderboard 32/206),
  🎉 (Pro 426), 🔥 (Home 256), 👤 (AppShell 598), 🏆 (Log 395).

### 6. États erreur absents ou trompeurs, destructions sans filet
- LeaderboardSheet : une panne réseau s'affiche comme « classement vide »
  (59/76/164).
- HistoryScreen : suppression de séance **sans confirmation** (117-121) —
  la charte impose AlertDialog.
- Progress/Measurements/ExerciseInfo : pas de skeleton local.
- Seul AISessionSheet a un vrai pattern erreur + retry (270-297) → à
  généraliser.

### 7. Duplication non factorisée → divergence visuelle
Le bottom sheet est recopié dans 6+ fichiers (maxHeight 88/90/92 vh/dvh,
radius 28px vs 3xl, handles différents). Idem section-headers, toggles,
chips, stat-cards, 3 mini-charts SVG quasi identiques. Le redesign doit
commencer par une **bibliothèque de composants** : `<Sheet>`, `<SectionHeader>`,
`<Toggle>` (≥44px), `<Chip>`, `<StatCard>`, `<Chart>`, et les jumeaux
`LoadingState`/`ErrorState` du bon `EmptyState` existant.

## Problèmes secondaires notables

- **AppShell** : le menu profil est devenu un écran de réglages déguisé en
  dropdown (8 entrées, 630 lignes de shell). Mérite une vraie page Profil.
- **LogScreen** : slider de poids 0→250 par 2,5 (100 crans sur ~300 px =
  imprécis au pouce) ; « Groupe du prochain exercice » conceptuellement
  confus ; date en `<input type="date">` natif non stylable.
- **StretchingScreen** : timer sans pause/retour/+10 s ; `illustrationId`
  défini mais jamais rendu (écran 100 % textuel).
- **CardReveal** : tap à côté pendant l'animation = révélation perdue ;
  préférer un « touche pour retourner » explicite.
- **ProScreen** : CTA avant les bénéfices, bouton debug visible, saisie CB
  minuscule.
- **ProgressScreen** : 4 stat-cards répétitives, graphe non interactif
  (aucun scrub tactile).
- **MeasurementsTab** : le graphe de poids est décoratif (points non
  tappables, pas d'objectif) ; opportunité : silhouette `MuscleMap` annotée.

## Ce que les trois directions corrigent d'office

Quel que soit le choix visuel, le redesign embarque :
1. Séries cochables + barre de session en direct (durée · volume · n/m).
2. CTA « Démarrer » en un tap depuis l'accueil.
3. Accueil recentré (hydratation, notifications, classement → ailleurs).
4. Contraste ≥ 3:1 partout, tap ≥ 44 px partout.
5. Bibliothèque de composants factorisés avant les écrans.
6. AlertDialog sur les suppressions + erreurs honnêtes avec retry.

## Les trois directions (maquettes sur /design)

| | V1 — L'Affiche | V2 — L'Instrument | V3 — Le Club |
|---|---|---|---|
| Personnalité | Poster athlétique, brut | Précision, montre de sport | Chaleureux, gamifié |
| Fond | Encre #0D0D0F | Noir OLED #000 | Brun chaud #1A1512 |
| Accent | Volt #D8FF3A | Violet #A78BFA (dosé) | Mandarine #FF8A3D + or |
| Typo | Archivo Black / Archivo | Inter + IBM Plex Mono | Bricolage Grotesque |
| Traits | Bordures 2px, ombres dures | Filets 1px, anneaux | Bordures 2px arrondies, tampons |
| Ce qu'elle raconte | « Entraîne-toi. » | « Mesure tout. » | « Ton club t'attend. » |
| Risque | Fatigante à long terme ? | Trop austère ? | Trop ludique pour certains ? |

Le violet historique ne survit tel quel que dans V2. Si V1 ou V3 est choisie,
mettre à jour la mémoire design-system et le CLAUDE.md du projet (prévu par
la mémoire de projet).

## Décision attendue d'Enzo

1. Ouvrir `/design` sur son téléphone, jouer avec les 3 maquettes.
2. Choisir une direction (ou un croisement — ex. structure V2 + chaleur V3).
3. Ensuite : bibliothèque de composants → écran Séance → Accueil → le reste.
