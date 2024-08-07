import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), db()],
  output: "server",
  adapter: vercel({
    webAnalytics:{
      enabled: true,
    }
  })
});