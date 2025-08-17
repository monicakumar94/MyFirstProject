import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: set this to your repo name
export default defineConfig({
  plugins: [react()],
  base: "/MYFIRSTPROJECT/",
})