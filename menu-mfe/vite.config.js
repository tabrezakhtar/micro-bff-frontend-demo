import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'menu_mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './Menu': './src/Menu.jsx'
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
    port: 5174,
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
