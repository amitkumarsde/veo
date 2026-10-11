import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
    // The API address is built into the site, so a build without it stops here.
    if (command === "build" && !loadEnv(mode, process.cwd(), "VITE_").VITE_API_URL) {
        throw new Error("VITE_API_URL is not set. Add it (your Render server address) before building, e.g. in Vercel's Environment Variables.");
    }

    return {
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
    };
});
