import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/",
    plugins: [react()],
    build: {
      outDir: "dist",
      lib: {
        entry: resolve(__dirname, "src/index.tsx"),
        name: "rcm-frontend",
        fileName: (format) => `index.${format}.js`,
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react-router",
          "react-router-dom",
          "@reduxjs/toolkit",
          "react-redux",
          "swr",
          "react-toastify",
          "@givc/shared-components",
        ],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react-router": "ReactRouter",
            "react-router-dom": "ReactRouterDOM",
            swr: "SWR",
            "react-toastify": "ReactToastify",
          },
        },
      },
    },
    server: {
      proxy: {
        "/billing-api": {
          target:   env.ABSOLUTE_BILLING_URL,
          // target: "http://172.22.24.27:3100",
          changeOrigin: true,
         

        },
        "/nphies-api": {
          target: env.ABSOLUTE_NPHIES_URL,
          changeOrigin: true,
          

        },

         "/hl7": {
          target: env.ABSOLUTE_HL7_URL,
          changeOrigin: true,
          rewrite(path) {
            return path.replace("/hl7", "");
          },
        },
      },
      port: Number(env.PORT) || 3500,
      allowedHosts: true,
      cors: true,
    },
  };
});
