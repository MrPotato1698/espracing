import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";


import tailwindcss from "@tailwindcss/vite";


// https://astro.build/config
export default defineConfig({
  integrations: [],
  output: "server",

  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),

  vite: {
    plugins: [tailwindcss()],
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