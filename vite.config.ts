import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        content: 'src/content.ts',
        background: 'src/background.ts',
        popup: 'src/popup/main.ts',
        settings: 'src/settings/main.ts'
      },
      output: {
        chunkFileNames: 'assets/js/[name].js',
        entryFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/[ext]/[name].[ext]',
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    },
    emptyOutDir: false,
    outDir: 'dist'
  }
})