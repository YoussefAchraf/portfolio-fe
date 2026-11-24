import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Dev/preview proxy:
//   /api/*      -> backend (et-be, :4000). The /api prefix is stripped, so /api/v1/hello -> <upstream>/v1/hello
//                  (same rewrite as docker/nginx/default.conf.template - keep them identical).
//   /socket.io  -> the backend; only used by the optional Realtime module.
// CSS: PostCSS (postcss.config.js) enables @custom-media breakpoints from src/styles/breakpoints.css.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUpstream = env.VITE_BACKEND_UPSTREAM || 'http://localhost:4000';

  const proxy = {
    '/api': {
      target: backendUpstream,
      changeOrigin: true,
      rewrite: (requestPath: string): string => requestPath.replace(/^\/api/, ''),
    },
    '/socket.io': {
      target: backendUpstream,
      changeOrigin: true,
      ws: true,
    },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    css: {
      modules: {
        // Class names stay camelCase in CSS and are accessed as styles.someClass.
        localsConvention: 'camelCaseOnly',
      },
    },
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          manualChunks(id: string): string | undefined {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor-react';
            if (id.includes('/@tanstack/')) return 'vendor-query';
            return undefined;
          },
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy,
    },
    preview: {
      port: 3000,
      strictPort: true,
      proxy,
    },
  };
});
