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
});