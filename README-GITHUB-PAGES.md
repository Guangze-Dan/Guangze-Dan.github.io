# 但光泽个人作品集

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

打开 `http://127.0.0.1:5174/`。

## 发布到 GitHub Pages（根路径部署）

本仓库部署到 `<用户名>.github.io` 仓库的根路径，Vite 的 `base` 已设置为 `'/'`。

1. 将项目推送到名为 `<用户名>.github.io` 的公开仓库。
2. 在仓库 Settings → Pages 中，Source 选择 **GitHub Actions**。
3. 推送 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建（`npm ci && npm run build`）并部署 `dist` 目录。
4. 等待构建完成后，访问 `https://<用户名>.github.io/`。

构建命令：

```powershell
npm.cmd run build
```

## 媒体文件说明

- 仓库内的 `public/projects/media/` 存放压缩后的 Web 版 MP4（H.264，1280px，无音轨，静音循环播放）。
- 原版高清视频备份在项目外的 `E:\硕士作品集\portfolio-media-original\`，需要原片时从中恢复。
- `public/projects/covers/` 中的 `p*.gif` 是作品卡片悬停时播放的动态预览封面。
