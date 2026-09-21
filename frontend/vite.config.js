import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],

    build: {
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, "index.html"),
                redirect: resolve(import.meta.dirname, "redirect.html"),
            },
        },
    },
});