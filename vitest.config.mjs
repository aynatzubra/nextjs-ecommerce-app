import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/'),
      'next/server': resolve(__dirname, '__mocks__/next-server.ts'),
    },
  },
  test: {
    //environment: 'jsdom',
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', './.next/**'],
  },

  deps: {
    inline: [
      /parse5/,
      /htmlparser2/,
      // /jsdom/
    ],
  },
})
