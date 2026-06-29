import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  dts: false,
  noExternal: [/^@tael\//],
  banner: { js: '#!/usr/bin/env node' },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
