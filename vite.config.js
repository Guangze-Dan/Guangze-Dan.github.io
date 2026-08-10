import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import fs from 'node:fs'

const rootDir = dirname(fileURLToPath(import.meta.url))

// 构建完成后把 index.html 复制为 404.html：
// GitHub Pages 对不存在的路径（如 /work/xxx 深链接）会返回 404.html，
// 应用在其中启动后由前端路由接管渲染，解决 SPA 刷新/分享链接 404 的问题。
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    apply: 'build',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist')
      fs.copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), copyIndexTo404()],
  base: '/',
})
