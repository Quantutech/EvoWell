
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

  return {
    plugins: [
      react(),
      mode === 'analyze' && visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    ],
    base: './', // Enforce relative paths for flexible deployment
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      headers: {
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
      }
    },
    preview: {
      host: true,
      port: port,
      allowedHosts: true
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['leaflet', 'react-leaflet', 'dompurify'],
            'vendor-utils': ['date-fns', 'date-fns-tz', 'zod'],
            'vendor-supabase': ['@supabase/supabase-js']
          }
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})
