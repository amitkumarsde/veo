import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    build: {
        rollupOptions: {
            output: {
                // Framework code changes rarely, so it stays cached across app deploys.
                manualChunks: (id) => (/node_modules\/(react|react-dom|react-router|scheduler|cookie)\//.test(id) ? "vendor" : undefined),
            },
        },
    },
});
