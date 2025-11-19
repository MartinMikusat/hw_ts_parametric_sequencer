import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParametricSequencer',
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'umd') return 'index.umd.js';
        return `index.${format}.js`;
      },
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [], 
      output: {
        globals: {},
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
