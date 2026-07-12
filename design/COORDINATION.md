# Coordination entre sessions Claude — redesign GymLog

Plusieurs sessions Claude travaillent en parallèle dans CE dépôt (même
worktree). Règles pour ne pas s'écraser :

1. **Jamais `git add -A` / `git add .`** — chaque session committe
   uniquement SES fichiers, listés explicitement.
2. **Périmètres** (à compléter par chaque session) :
   - Session A (nuit du 12 juil., audit + directions) : `design/AUDIT_UX.md`,
     `app/design/page.tsx` (index), `app/design/layout.tsx`,
     `app/design/_mock.ts`, `app/design/v1|v2|v3/`.
   - Session B (?) : `app/design/poster/`, `app/design/club/` — merci de
     noter ici votre périmètre et votre intention.
3. **`app/design/_mock.ts` et `app/design/layout.tsx` sont partagés** :
   modification additive uniquement (ajouter des exports/fonts, ne pas
   renommer ni supprimer l'existant).
4. **Index `/design`** : tenu par la session A. Si vous ajoutez une
   variante, ajoutez une entrée dans le tableau `DIRECTIONS` de
   `app/design/page.tsx` (modification additive) ou notez-la ici et la
   session A l'intégrera.
5. `scripts/push-table.sql` appartient à Enzo (non commité, ne pas toucher).
6. Avant de committer : `git status -s` et vérifier qu'aucun fichier d'une
   autre session ne part dans le commit.
