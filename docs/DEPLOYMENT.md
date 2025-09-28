# 部署指南

本文档介绍如何部署海报编辑器项目到不同的平台。

## 🚀 快速部署

### GitHub Pages

1. **自动部署** (推荐)
   ```bash
   # 推送到main分支会自动触发部署
   git push origin main
   ```

2. **手动部署**
   ```bash
   npm run build
   # 将dist目录内容上传到gh-pages分支
   ```

### Vercel

1. **连接GitHub仓库**
   - 访问 [Vercel](https://vercel.com)
   - 导入GitHub仓库
   - 选择框架预设：Vite

2. **配置构建设置**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Netlify

1. **连接仓库**
   - 访问 [Netlify](https://netlify.com)
   - 连接GitHub仓库

2. **构建设置**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **环境变量** (如需要)
   ```
   NODE_VERSION=18
   ```

### 自托管服务器

1. **构建项目**
   ```bash
   npm install
   npm run build
   ```

2. **配置Web服务器**
   
   **Nginx配置示例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

   **Apache配置示例**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /path/to/dist
       
       <Directory /path/to/dist>
           Options -Indexes
           AllowOverride All
           Require all granted
       </Directory>
       
       # SPA路由支持
       FallbackResource /index.html
   </VirtualHost>
   ```

## 🔧 环境配置

### 环境变量

创建 `.env.production` 文件：
```env
VITE_APP_TITLE=海报编辑器
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.your-domain.com
```

### 构建优化

1. **分析包大小**
   ```bash
   npm run build:analyze
   ```

2. **优化配置** (vite.config.ts)
   ```typescript
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             fabric: ['fabric'],
             ui: ['lucide-react', 'zustand']
           }
         }
       },
       chunkSizeWarningLimit: 1000
     }
   })
   ```

## 🌐 CDN配置

### 静态资源CDN

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com/' 
    : '/'
})
```

### 字体CDN

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## 🔒 安全配置

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' api.your-domain.com;
">
```

### HTTPS配置

确保生产环境使用HTTPS：
```javascript
// 强制HTTPS重定向
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

## 📊 监控和分析

### 性能监控

```typescript
// 添加性能监控
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart);
  });
}
```

### 错误监控

```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 发送到错误监控服务
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  // 发送到错误监控服务
});
```

## 🚀 CI/CD流程

### GitHub Actions

项目已配置自动化CI/CD流程：

1. **代码检查** - ESLint + TypeScript
2. **构建测试** - 多环境构建验证
3. **自动部署** - 部署到GitHub Pages

### 自定义部署脚本

```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署..."

# 安装依赖
npm ci

# 代码检查
npm run lint
npm run type-check

# 构建项目
npm run build

# 部署到服务器
rsync -avz --delete dist/ user@server:/var/www/poster-maker/

echo "✅ 部署完成!"
```

## 📋 部署检查清单

- [ ] 环境变量配置正确
- [ ] 构建无错误和警告
- [ ] 静态资源路径正确
- [ ] 路由配置支持SPA
- [ ] HTTPS证书配置
- [ ] CDN配置 (如使用)
- [ ] 性能监控设置
- [ ] 错误监控设置
- [ ] 备份策略制定

## 🆘 故障排除

### 常见问题

1. **路由404错误**
   - 确保服务器配置支持SPA路由
   - 检查base路径配置

2. **静态资源加载失败**
   - 检查资源路径配置
   - 确认CDN配置正确

3. **构建失败**
   - 检查Node.js版本
   - 清理缓存: `npm run clean`

4. **性能问题**
   - 启用Gzip压缩
   - 配置静态资源缓存
   - 使用CDN加速

### 日志查看

```bash
# 查看构建日志
npm run build 2>&1 | tee build.log

# 查看服务器日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```