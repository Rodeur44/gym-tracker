# GymLog — Claude Instructions

Application de musculation haut de gamme. Next.js 16 (App Router) · Tailwind v4 · Framer Motion · Supabase · shadcn/ui · Vercel.

@AGENTS.md

---

## UI/UX Pro Max — Règles de base

Principes extraits de `nextlevelbuilder/ui-ux-pro-max-skill` et adaptés à la stack exacte du projet.

---

### 1. Icônes (Lucide React)

- **Bibliothèque unique** : `lucide-react` uniquement. Zéro emoji comme icône structurelle.
- **Stroke cohérent** : `strokeWidth={1.8}` par défaut, `strokeWidth={2}` pour l'état actif/sélectionné. Ne jamais mélanger des épaisseurs différentes au même niveau hiérarchique.
- **Taille** : `size={20}` pour les icônes inline, `size={22}` pour la nav, `size={24}` pour les actions primaires, `size={32}+` pour les états vides.
- **Style unique par niveau** : ne pas mélanger outline et filled au même niveau d'interface.
- **`aria-label` obligatoire** sur tout bouton sans texte visible : `<button aria-label="Supprimer la série">`.
- **Zone de tap minimum** : `min-h-[44px] min-w-[44px]` sur tout élément interactif. Utiliser `p-2.5` ou `p-3` si l'icône est plus petite.
- **Contraste** : ≥ 3:1 pour les icônes décoratives, ≥ 4.5:1 pour les icônes porteuses d'information.

```tsx
// ✅ Correct
<button aria-label="Fermer" className="w-11 h-11 flex items-center justify-center">
  <X size={20} strokeWidth={1.8} />
</button>

// ❌ Interdit
<button>🗑️</button>
<button><X /></button> {/* pas d'aria-label */}
```

---

### 2. Espacement — Rythme 4/8px

Utiliser **exclusivement** les multiples du système 4/8px. Aucune valeur arbitraire.

| Token Tailwind | Valeur | Usage |
|---|---|---|
| `gap-1` / `p-1` | 4px | Micro-espacement (badge, chip interne) |
| `gap-2` / `p-2` | 8px | Espacement composant interne |
| `gap-3` / `p-3` | 12px | Petits groupes |
| `gap-4` / `p-4` | 16px | Padding card standard |
| `gap-5` / `p-5` | 20px | Espacement section |
| `gap-6` / `p-6` | 24px | Padding page standard |
| `gap-8` / `p-8` | 32px | Séparation sections |
| `gap-12` / `p-12` | 48px | Espacement majeur |

**Hiérarchie verticale** : 16px entre éléments liés, 24px entre groupes, 32-48px entre sections.

```tsx
// ✅ Correct
<div className="flex flex-col gap-4 p-5">
  <div className="flex items-center gap-2">...</div>
</div>

// ❌ Interdit
<div style={{ gap: '13px', padding: '19px' }}>
```

---

### 3. Typographie

- **Polices** : `DM Sans` (variable `--font-sans`) pour le texte, `DM Mono` (variable `--font-mono`) pour les chiffres/données.
- **Hiérarchie** :
  - Titre écran : `text-xl font-semibold tracking-tight`
  - Titre carte : `text-[15px] font-semibold tracking-tight`
  - Corps principal : `text-sm` (14px)
  - Métadonnée / label : `text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500`
  - Chiffre mono : `font-mono font-bold text-white`
- **Contraste minimum** :
  - Texte principal : ≥ 4.5:1 → `text-white` ou `text-zinc-100`
  - Texte secondaire : ≥ 3:1 → `text-zinc-400` minimum (pas `text-zinc-600` pour du texte lisible)
  - Placeholder : `placeholder:text-zinc-600`
- Ne jamais utiliser `text-zinc-700` ou plus clair pour du contenu informatif.

---

### 4. Design tokens — Palette violet

Ces valeurs sont les seules sources de vérité. Ne pas introduire de nouvelles couleurs.

```
Accent principal : #A78BFA  (violet-400)
Accent foncé    : #7C3AED  (violet-600)
Accent gradient : linear-gradient(135deg, #6D28D9, #7C3AED 50%, #8B5CF6)
Glow accent     : rgba(139, 92, 246, 0.35)  →  shadow-[0_0_12px_rgba(139,92,246,0.4)]

Surface 1 (fond) : #0A0A0A
Surface 2 (card) : rgba(255,255,255,0.025)  →  bg-[#1C1C1C]
Surface 3 (input): rgba(255,255,255,0.045)
Border           : rgba(255,255,255,0.06)   →  border-white/[0.06]
Border forte     : rgba(255,255,255,0.10)
```

**Tags musculaires** (définis dans `lib/constants.ts`) — utiliser `TAG_CLR[type]` et `TAG_BG[type]`, jamais de valeurs codées en dur pour les couleurs de type.

---

### 5. Glassmorphism

Classe utilitaire disponible dans `globals.css` :

```css
.card-glass {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
}
.glass-strong {
  background: rgba(10,10,10,0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
```

Règles :
- Utiliser `card-glass` pour toutes les cartes secondaires.
- `glass-strong` réservé au header et à la nav.
- Le `backdrop-filter` nécessite un ancêtre avec `position: relative` et un fond non transparent.
- Ne pas empiler plus de 2 niveaux de glassmorphism.
- Ajouter `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04)` pour simuler un reflet de lumière.

---

### 6. Animations — Framer Motion

- **Micro-interactions** (tap, hover) : `duration: 0.15–0.25s`
- **Transitions d'écran** : `duration: 0.3–0.5s`
- **Spring pour les éléments physiques** : `type: 'spring', stiffness: 300–400, damping: 25–30`
- **Ease recommandé** : `[0.16, 1, 0.3, 1]` (ease-out exponentiel) — à passer comme `string` pour éviter les erreurs TypeScript avec Framer Motion v12 : utiliser `'easeOut'` dans les `Variants`, et les tableaux directement dans les props `transition`.
- **Sortie plus rapide que l'entrée** : exit en 60–70% de la durée d'entrée.
- **`AnimatePresence mode="wait"`** pour les changements d'écran.
- **Variants typés** : toujours `import type { Variants } from 'framer-motion'` et typer les objets variants.

```tsx
// ✅ Correct — Variants typés
import type { Variants } from 'framer-motion'

const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// Transition séparée du variant
<motion.div variants={fadeUp} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

// ✅ Spring sur tap
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
```

---

### 7. Composants shadcn/ui

- **Installation** : `pnpm dlx shadcn@latest add <component>`, jamais de copier-coller manuel.
- **Variants** : toujours utiliser le prop `variant` plutôt que des classes conditionnelles inline.
- **Loading states** : `<Skeleton>` qui reproduit exactement la forme du contenu chargé — même hauteur, même largeur, même `border-radius`.
- **Confirmations destructives** : `<AlertDialog>` obligatoire pour supprimer/effacer des données.
- **Formulaires** : `Form + FormField + FormLabel + FormMessage` + `zodResolver`.
- **Toasts** : `toast.success()` / `toast.error()` via Sonner, `<Toaster>` dans le layout racine.
- **Composition** : `asChild` pour wrapper un `<Link>` dans un `<Button>`.
- **Imports** : toujours individuels — `import { Button } from "@/components/ui/button"`, jamais d'index barrel.

---

### 8. États d'interface obligatoires

Chaque écran doit gérer **trois états** :

**État vide** — quand aucune donnée :
```tsx
// Structure type
<div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
  <div className="w-18 h-18 rounded-[22px] flex items-center justify-center mb-5 border"
    style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.05))',
             borderColor: 'rgba(139,92,246,0.18)', boxShadow: '0 0 30px -10px rgba(139,92,246,0.35)' }}>
    <IconComponent size={32} className="text-[#A78BFA]" />
  </div>
  <h3 className="text-base font-semibold text-zinc-200 mb-2">Titre état vide</h3>
  <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">Message explicatif court.</p>
</div>
```

**État loading** — skeleton qui reproduit la forme exacte :
```tsx
import { Skeleton } from "@/components/ui/skeleton"
// Skeleton = même h/w/rounded que le contenu réel
<Skeleton className="h-4 w-[140px] rounded-full" />
```

**État erreur** — message avec action de retry :
```tsx
<div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
  <AlertCircle size={14} /> Message d'erreur
</div>
```

---

### 9. Optimistic UI

- **Principe** : mettre à jour l'état React **avant** l'appel Supabase, revenir en arrière (`revert`) en cas d'erreur.
- **Jamais de spinner** sur des actions CRUD simples (save, delete, update).
- **IDs temporaires** : `const tempId = \`temp-${Date.now()}\`` pour les insertions.
- Pattern déjà implémenté dans `context/AppContext.tsx` — suivre ce modèle.

---

### 10. Accessibilité (minimum)

- `aria-label` sur tous les boutons sans texte visible.
- `aria-label` sur les inputs sans `<label>` visible.
- Contraste texte : voir §3.
- Zone de tap ≥ 44px : voir §1.
- États disabled : `disabled` sémantique + opacité réduite (`opacity-60`) + pas d'action.
- `role` correct : ne pas utiliser `<div onClick>` à la place de `<button>`.

---

### 11. Next.js — Règles critiques

*(Extrait de nextjs.csv — sévérité High uniquement)*

- `<Image>` de `next/image` pour toutes les images distantes — configurer `remotePatterns` dans `next.config.ts`.
- `NEXT_PUBLIC_` prefix obligatoire pour les variables d'env accessibles côté client.
- Ne pas exposer les secrets serveur dans le code client.
- Sanitiser toutes les entrées utilisateur avant traitement.
- `aria-label` sur les inputs sans label visible.
- `error.tsx` pour la gestion d'erreurs au niveau des routes.

---

### 12. Checklist avant tout commit UI

- [ ] Icônes : `strokeWidth` cohérent, `aria-label` sur les icon-only buttons
- [ ] Espacement : multiples de 4/8px uniquement
- [ ] Contraste : texte principal ≥ 4.5:1, secondaire ≥ 3:1
- [ ] Zones de tap : ≥ 44px height sur tout élément interactif
- [ ] Variants Framer Motion : typés avec `import type { Variants }`
- [ ] États vide + loading + erreur présents sur les écrans de données
- [ ] Pas de spinner sur les actions CRUD (optimistic update)
- [ ] Pas de valeurs de couleur codées en dur hors des tokens
- [ ] `next build` passe sans erreur TypeScript
