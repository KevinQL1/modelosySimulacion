import { defineConfig } from 'vite';
import { resolve } from 'path';

module.exports = defineConfig({
  root: 'Front',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'Front/html/index.html'),
        asignaturasAdmin: resolve(__dirname, 'Front/html/asignaturas-admin.html'),
        gruposAdmin: resolve(__dirname, 'Front/html/grupos-admin.html'),
        grupoEstu: resolve(__dirname, 'Front/html/grupo_estu.html'),
        videoEstu: resolve(__dirname, 'Front/html/video_estu.html'),
        videoCronometro: resolve(__dirname, 'Front/html/video-cronometro.html'),
        videosGrupo: resolve(__dirname, 'Front/html/videos-grupo.html')
      }
    }
  },
  server: {
    port: 3000
  }
});
