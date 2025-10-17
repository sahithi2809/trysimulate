import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/trysimulate/', // Replace 'trysimulate' with your repository name
  server: {
    port: 3000
  }
})

