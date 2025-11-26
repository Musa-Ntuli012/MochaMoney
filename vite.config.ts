import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'MochaMoney - Brew Your Financial Future',
        short_name: 'MochaMoney',
        description: 'Coffee-themed personal finance tool',
        theme_color: '#3F2A22',
        background_color: '#E8D7B9',
        display: 'standalone',
        icons: [
          {
            src: 'https://drive.google.com/uc?export=view&id=19GAT6JY-Uc0Thf4nIPiP79bnRGxScEp5',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://drive.google.com/uc?export=view&id=19GAT6JY-Uc0Thf4nIPiP79bnRGxScEp5',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.mongodb\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mongodb-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

