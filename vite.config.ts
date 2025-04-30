import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Precise Leak Detection',
        short_name: 'Precise Leak',
        description: 'Business management tool for leak detection services',
        theme_color: '#1E40AF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets//icon_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
