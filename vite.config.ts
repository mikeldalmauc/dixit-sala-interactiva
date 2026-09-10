import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/dixit-euskadi/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // El servidor de desarrollo se accede desde varias mesas-pantalla y la
      // pared en la misma red local, no solo desde localhost.
      allowedHosts: true as const,
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
        interval: Number(process.env.CHOKIDAR_INTERVAL ?? 100),
      },
      hmr:
        process.env.DISABLE_HMR !== 'true'
          ? {
              host: process.env.VITE_HMR_HOST,
              clientPort: process.env.VITE_HMR_CLIENT_PORT
                ? Number(process.env.VITE_HMR_CLIENT_PORT)
                : undefined,
            }
          : false,
    },
  };
});
