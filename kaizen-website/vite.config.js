import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createMeshyHandler } from './api/meshy.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const handler = createMeshyHandler({ apiKey: env.MESHY_API_KEY || env.VITE_MESHY_API_KEY })
  return {
    plugins: [react(), {
      name: 'local-meshy-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.split('?')[0] === '/api/meshy') return handler(req, res)
          next()
        })
      },
    }],
  }
})
