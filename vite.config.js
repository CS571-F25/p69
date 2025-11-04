import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
plugins: [react()],
base: '/571-final-project/',
build: {
outDir: 'docs'
}
})