import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/trysimulate/', // GitHub Pages base path
  server: {
    port: 3000
  }
})

