import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Texte FR : les apostrophes dans le JSX (« l'utilisateur ») sont
      // omniprésentes et parfaitement valides — règle sans valeur ici.
      'react/no-unescaped-entities': 'off',

      // Règles « React Compiler » de react-hooks v6 : elles signalent des
      // patterns volontaires et fonctionnels dans ce codebase (hydratation
      // localStorage dans un effet de montage, Date.now()/Math.random() dans
      // un useMemo, écriture de ref en rendu). On les garde en warning pour
      // rester informatif sans bloquer le lint.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
