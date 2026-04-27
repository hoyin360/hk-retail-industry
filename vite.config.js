import { defineConfig } from 'vite';

export default defineConfig({
  // 这里的 base 必须和你 GitHub 仓库的名字一模一样，两边都要有斜杠
  // 如果你仓库还没起名，建议起名为 hk-retail-datastory
  base: '/hk-retail-industry/', 
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true
  }
});

