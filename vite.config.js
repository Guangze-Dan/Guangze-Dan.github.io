import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import fs from 'node:fs'

const rootDir = dirname(fileURLToPath(import.meta.url))

// 构建后把入口 CSS/JS 内联进 index.html（单请求站点）：
// GitHub Pages 从国内访问时每个请求的首字节要 4-6 秒，把 3-4 个请求合成 1 个
// 文档，首屏从 ~15 s 降到一次往返。之后再把 index.html 复制为 404.html，
// 保证 SPA 深链接可用。
function inlineSingleFile() {
  return {
    name: 'inline-single-file',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist')
      const htmlPath = resolve(distDir, 'index.html')
      let html = fs.readFileSync(htmlPath, 'utf8')
      const inlined = []

      html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, href) => {
        if (!href.startsWith('/')) return m
        const file = resolve(distDir, href.slice(1))
        if (!fs.existsSync(file)) return m
        inlined.push(file)
        return `<style>${fs.readFileSync(file, 'utf8')}</style>`
      })

      html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (m, src) => {
        if (!src.startsWith('/')) return m
        const file = resolve(distDir, src.slice(1))
        if (!fs.existsSync(file)) return m
        inlined.push(file)
        const js = fs.readFileSync(file, 'utf8').replace(/<\/script/gi, '<\/script')
        return `<script type="module">${js}</script>`
      })

      // preloads for inlined assets are dead weight
      html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '')

      fs.writeFileSync(htmlPath, html)
      fs.copyFileSync(htmlPath, resolve(distDir, '404.html'))
      for (const file of inlined) {
        try { fs.unlinkSync(file) } catch { /* ignore */ }
      }
      console.log(`[inline-single-file] inlined ${inlined.length} assets, html ${(html.length / 1024).toFixed(0)} KB`)
    },
  }
}

export default defineConfig({
  plugins: [react(), inlineSingleFile()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // 全部代码打成一个文件：内联进 index.html 后不存在任何外部 chunk，
        // 懒加载模块也会被合并（LabPage、auto-translate），首屏只有一次请求。
        inlineDynamicImports: true,
      },
    },
  },
})
