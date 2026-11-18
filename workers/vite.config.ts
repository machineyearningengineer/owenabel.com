import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

// Astro owns rendering. This assets-only Vite build packages its completed
// output for Workers without adding a server-side application or rebundling it.
export default defineConfig({
  publicDir: "../dist",
  plugins: [cloudflare()],
  server: { port: 8788, strictPort: true },
});
