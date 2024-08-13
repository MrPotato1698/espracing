import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), auth()],
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
});