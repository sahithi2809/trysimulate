# 🚀 Deployment Guide — TrySimulate

This guide covers deploying your TrySimulate MVP to various platforms.

## Option 1: Vercel (Recommended) ⭐

Vercel offers free hosting with automatic deployments from Git.

### Steps:

1. **Push to GitHub**
   ```bash
   cd CODEBASE
   git init
   git add .
   git commit -m "Initial commit - TrySimulate MVP"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-project.vercel.app`

### Auto-deployments:
Every push to `main` branch automatically deploys.

---

## Option 2: Netlify

Similar to Vercel with drag-and-drop deployment option.

### Steps:

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist/` folder
   - Or connect your GitHub repo for auto-deployments

3. **Configure** (if needed)
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## Option 3: GitHub Pages

Free hosting directly from your GitHub repository.

### Steps:

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add these scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/'
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://username.github.io/repo-name/`

---

## Option 4: Railway

Backend-ready platform (useful when you add APIs later).

### Steps:

1. **Push to GitHub** (see Option 1)

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway auto-detects and deploys

---

## Option 5: Manual Deployment (Any Static Host)

Build locally and upload to any web host.

### Steps:

1. **Build**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting provider:
   - AWS S3 + CloudFront
   - DigitalOcean Spaces
   - Traditional web hosting (cPanel, etc.)

3. **Configure** your server to serve `index.html` for all routes (for React Router)

   **Nginx example:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

   **Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

---

## Environment Variables (Future)

When you integrate real APIs:

1. **Create `.env` file**
   ```
   VITE_OPENAI_API_KEY=your_key_here
   VITE_BACKEND_URL=https://api.yourdomain.com
   ```

2. **Access in code**
   ```javascript
   const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
   ```

3. **Set on hosting platform**
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment variables
   - Railway: Variables tab

---

## Custom Domain

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

### Netlify:
1. Domain settings → Add custom domain
2. Follow DNS configuration steps

### GitHub Pages:
1. Add `CNAME` file in `public/` folder with your domain
2. Update DNS records to point to GitHub Pages

---

## Pre-deployment Checklist

- [ ] All features tested locally
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Performance optimized (lazy loading, etc.)
- [ ] localStorage working correctly
- [ ] Build completes without errors
- [ ] Meta tags for SEO (add to index.html)
- [ ] Favicon added
- [ ] Analytics setup (optional)

---

## Post-deployment

1. **Test all features** on the live site
2. **Check mobile responsiveness**
3. **Verify localStorage** works in production
4. **Monitor performance** (Lighthouse score)
5. **Share the link!** 🎉

---

## Troubleshooting

**Blank page after deployment?**
- Check console for errors
- Verify `base` path in `vite.config.js`
- Ensure server is configured for SPA routing

**404 on page refresh?**
- Configure server for SPA (see Option 5)
- Or use hash routing: `<HashRouter>` instead of `<BrowserRouter>`

**Images not loading?**
- Use absolute paths or import images
- Check case sensitivity (file names)

---

## Scaling for Production

When ready to scale beyond MVP:

1. **Add CDN** for faster loading
2. **Implement Caching** strategies
3. **Lazy Load** components and routes
4. **Optimize Images** (WebP, compression)
5. **Add Monitoring** (Sentry, LogRocket)
6. **Backend API** for data persistence
7. **Authentication** system
8. **Database** (PostgreSQL, MongoDB)

---

**Your TrySimulate MVP is ready to share with the world! 🚀**

