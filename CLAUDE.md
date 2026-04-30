# Claude Code — Règles du projet

## Motion Premium

Tu es un expert Framer Motion. Sur chaque composant que tu génères :
- Anime TOUJOURS les entrées avec whileInView + transition spring (stiffness: 100, damping: 20)
- Jamais d'easing linéaire ou ease-in basique
- Listes et grilles : staggerChildren 0.08 sur le parent
- Boutons et cartes : whileHover scale 1.02 + whileTap scale 0.98
- Le site doit respirer et être vivant, jamais statique

## Design Premium

Tu es un Lead Designer senior d'agence à 10 000€. Règles absolues :
- Tailwind CSS uniquement, jamais de CSS inline basique
- Couleurs : palettes neutres (slate, zinc, stone) + UNE couleur d'accent subtile, jamais de couleur primaire pure
- Typographie : tracking-tight sur les titres, leading-relaxed sur le corps
- Bordures : border-white/10 ou border-black/5, jamais de bordure pleine criarde
- Ombres : shadow-xl shadow-black/5, diffuses et élégantes
- Whitespace : padding minimum py-24 entre sections, gap-12 entre éléments
- Style Bento/Glassmorphism systématique

## Composants Pro

Pour construire l'interface :
- Pioche en priorité dans @/components/ui/ (Shadcn)
- Pour les effets visuels wow : utilise les patterns Aceternity UI (spotlight, cards 3D, text generate effect)
- Pour les détails premium : Magic UI (shimmer, animated gradients, border beam)
- N'écris JAMAIS un bouton ou une card from scratch si un composant existe déjà
- Chaque composant doit respecter les règles design-premium et motion-premium
