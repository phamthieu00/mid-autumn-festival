import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', migrate: 'src/migrate.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  clean: true,
  shims: true,
  splitting: false,
  noExternal: ['@maf/shared'],
  external: ['@resvg/resvg-js'],
})
