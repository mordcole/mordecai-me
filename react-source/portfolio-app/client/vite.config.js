import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const COUNTER_DIR = path.resolve(__dirname, '../../../counter-app-frontend')

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
}

// Serves the pre-built counter app at /counter during dev,
// mirroring what Nginx does in production.
function serveCounterApp() {
  return {
    name: 'serve-counter-app',
    configureServer(server) {
      server.middlewares.use('/counter', (req, res, _next) => {
        const url = !req.url || req.url === '/' ? '/index.html' : req.url
        const filePath = path.join(COUNTER_DIR, url)
        const ext = path.extname(filePath)

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', MIME[ext] || 'text/plain')
          fs.createReadStream(filePath).pipe(res)
        } else {
          res.setHeader('Content-Type', 'text/html')
          fs.createReadStream(path.join(COUNTER_DIR, 'index.html')).pipe(res)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serveCounterApp()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    outDir: '../../../public',
    emptyOutDir: true,
  }
})
