// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // Listen on all addresses
    port: 5173, // or any port you're using
    allowedHosts: [
      'damodertraders-z8yc.onrender.com',
      'localhost',
      '127.0.0.1'
    ]
  },
  // If you have a backend API, add proxy configuration:
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'damodertraders-z8yc.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // If your API requests start with /api, proxy them
      '/api': {
        target: 'https://damodertraders-z8yc.onrender.com',
        changeOrigin: true,
        secure: false, // Set to true if your backend has valid SSL
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
