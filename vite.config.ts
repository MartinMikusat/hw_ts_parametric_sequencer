import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const entries = {
  '3d': resolve(__dirname, 'src/3d/index.ts'),
  '2d': resolve(__dirname, 'src/2d/index.ts'),
};

export default defineConfig({
  build: {
    lib: {
      entry: entries,
      name: 'ParametricSequencer',
      fileName: (format, entryName) => {
        const base = entryName ?? 'index';
        return `${base}/index.mjs`;
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [],
      output: {
        globals: {},
        entryFileNames: ({ name }) => {
          const base = name ?? 'index';
          return `${base}/index.mjs`;
        },
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/2d', 'src/3d'],
      outDir: 'dist',
      entryRoot: 'src',
      copyDtsFiles: false,
    }),
  ],
});
