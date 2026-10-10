# Yaswant Code LMS — InfinityFree Deployment Guide

This guide explains how to deploy **Yaswant Code** to **InfinityFree** via automated GitHub Actions CI/CD, local terminal script, or manual FTP.

---

## 📁 Directory Structure on InfinityFree

Because you have multiple websites hosted on your InfinityFree account, the FTP root directory contains individual folders for each domain:

```text
FTP Root (/)
├── other-domain-1.com/
│   └── htdocs/
├── other-domain-2.com/
│   └── htdocs/
└── yaswant.co.in/
    └── htdocs/          <-- 🎯 Target folder for Yaswant Code
        ├── index.html
        ├── index.php
        ├── .htaccess
        ├── assets/
        └── api/
```

All compiled files from `dist/` must be placed directly inside:
```
yaswant.co.in/htdocs/
```

---

## 🚀 Method 1: Automated GitHub Actions CI/CD (Recommended)

Whenever you push to the `main` branch, GitHub Actions will automatically compile your project and deploy the updated files directly to `yaswant.co.in/htdocs/` via FTP!

### Step 1: Find Your InfinityFree FTP Credentials
1. Log in to [InfinityFree Client Area](https://dash.infinityfree.com/).
2. Click on your active account (the one hosting `yaswant.co.in`).
3. Click **Manage** or scroll down to **FTP Details**:
   - **FTP Hostname**: `ftpupload.net`
   - **FTP Port**: `21`
   - **FTP Username**: e.g., `if0_12345678` or `epiz_12345678`
   - **FTP Password**: Click **Show Password** to copy.

### Step 2: Add Secrets to GitHub Repository
1. Go to your GitHub repository: [`https://github.com/yaswantpandey/yaswant-code`](https://github.com/yaswantpandey/yaswant-code).
2. Click **Settings** -> **Secrets and variables** -> **Actions**.
3. Under **Repository secrets**, click **New repository secret**:
   - **Name**: `FTP_USERNAME`
   - **Secret**: *(Your InfinityFree username, e.g., `if0_12345678`)*
4. Click **New repository secret** again:
   - **Name**: `FTP_PASSWORD`
   - **Secret**: *(Your InfinityFree FTP password)*
5. *(Optional custom settings — already defaulted in workflow)*:
   - `FTP_SERVER`: `ftpupload.net` (default)
   - `FTP_REMOTE_DIR`: `yaswant.co.in/htdocs/` (default)
   - `FTP_PORT`: `21` (default)

### Step 3: Trigger the Workflow
Whenever you push code:
```bash
git push origin main
```
Or go to GitHub -> **Actions** -> **Deploy to InfinityFree** -> **Run workflow**.

---

## 💻 Method 2: Local One-Command Deploy (`npm run deploy:ftp`)

You can also deploy directly from your local terminal using the built-in script:

1. Copy `.env.example` to `.env` (if not done already) and set your InfinityFree FTP credentials:
   ```env
   FTP_SERVER=ftpupload.net
   FTP_PORT=21
   FTP_USERNAME=your_infinityfree_username
   FTP_PASSWORD=your_infinityfree_password
   FTP_REMOTE_DIR=yaswant.co.in/htdocs/
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm run deploy:ftp
   ```

---

## 📂 Method 3: Manual Upload via FileZilla

1. Open FileZilla and enter your credentials:
   - **Host**: `ftpupload.net`
   - **Username**: Your InfinityFree FTP username (`if0_...`)
   - **Password**: Your InfinityFree FTP password
   - **Port**: `21`
2. Connect to the server.
3. In the Remote Site panel, open the folder:
   ```
   /yaswant.co.in/htdocs/
   ```
4. If there are default files (such as placeholder `index2.html`), delete them.
5. In your local site panel, open your project's `dist/` directory.
6. Select all files and folders inside `dist/` (including `.htaccess`) and upload them into `/yaswant.co.in/htdocs/`.
   > **Note**: In FileZilla, make sure hidden files are visible: `Server` -> `Force showing hidden files`.

---

## ⚙️ InfinityFree MySQL & PHP Configuration

### 1. Connecting MySQL Database on InfinityFree
Unlike Hostinger where database host is `localhost`, **InfinityFree database host is NOT `localhost`**.

1. In InfinityFree Client Area, open **MySQL Databases** or **Control Panel (vPanel)**.
2. Note your database details:
   - **MySQL Hostname**: e.g., `sql100.infinityfree.com` (or `sql202.infinityfree.com`, etc.)
   - **MySQL Database Name**: e.g., `if0_12345678_lms`
   - **MySQL Username**: e.g., `if0_12345678`
   - **MySQL Password**: Your InfinityFree vPanel password
3. If using database features in PHP, configure them in `yaswant.co.in/htdocs/api/config.php` or `.env`.

### 2. Verify `.htaccess` SPA Routing
InfinityFree runs Apache with `mod_rewrite` enabled. The uploaded `.htaccess` file ensures that:
- Refreshing routes like `/courses` or `/student-dashboard` will route to `index.html` without 404 errors.
- API endpoints in `/api/*.php` execute directly as PHP scripts.

---

## ✅ Deployment Verification Checklist

1. **Visit Frontend**: Go to `https://yaswant.co.in` — the application should load smoothly.
2. **SPA Sub-route Refresh**: Visit `https://yaswant.co.in/courses` and press Refresh (F5). It should load without 404.
3. **PHP Health Check**: Visit `https://yaswant.co.in/api/health.php` — it should return a JSON response verifying PHP execution.
