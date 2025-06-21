import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
  ],
  output: "server",

  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),

  vite: {
    build:{
      rollupOptions: {
        external: ['child_process', 'fs', 'path']
      }
    },
    plugins: [tailwindcss()],
  },

  build: {
    exclude: ['tools/**/*']
  },

  // Server proxy local, para pruebas en desarrollo
  // server: {
  //   proxy: {
  //     '/stracker': {
  //       target: 'https://es2.assettohosting.com:10018',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});