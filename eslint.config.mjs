import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Las imágenes de Portable Text no tienen dimensiones conocidas en build.
      '@next/next/no-img-element': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    // Artefactos de skills de IA (npx skills add -a opencode): no son código de la app.
    '.agents/**',
  ]),
])

export default eslintConfig
