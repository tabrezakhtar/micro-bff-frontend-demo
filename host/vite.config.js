import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_app',
      remotes: {
        'menu-mfe': 'http://localhost:5174/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false
        }
      }
    })
  ],
  server: {
    port: 5173,
    cors: {
      origin: '*',
      credentials: true
    }
  },
  preview: {
    port: 5173,
    cors: {
      origin: '*',
      credentials: true
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
