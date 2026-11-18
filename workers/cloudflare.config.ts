import { defineConfig, triggers } from "cf/config";

export default defineConfig(({ mode }) => ({
  worker: {
    name: mode === "cutover" || mode === "bridge" ? "owenabel-com" : "owenabel-com-preview",
    compatibilityDate: "2026-05-12",
    workersDev: true,
    domains: mode === "cutover" ? ["owenabel.com", "www.owenabel.com"] : [],
    triggers:
      mode === "bridge"
        ? [
            triggers.fetch({ pattern: "owenabel.com/*", zone: "owenabel.com" }),
            triggers.fetch({ pattern: "www.owenabel.com/*", zone: "owenabel.com" }),
          ]
        : [],
    assets: {
      htmlHandling: "drop-trailing-slash",
      notFoundHandling: "404-page",
      runWorkerFirst: false,
    },
  },
}));
