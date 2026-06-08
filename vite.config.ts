import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 认证接口 → 平台 API（api.yazs.top）
      '/api/user/auth': {
        target: 'https://api.yazs.top',
        changeOrigin: true,
        secure: false,
      },
      // 文物数据接口 → 知识图谱子系统（se-cs2305.yazs.top）
      '/api': {
        target: 'https://se-cs2305.yazs.top',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
