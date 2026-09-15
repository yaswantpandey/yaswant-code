# Yaswant Code LMS — Hostinger Deployment Guide

This guide provides step-by-step instructions to deploy **Yaswant Code** to **Hostinger** (Shared, Cloud, or VPS Hosting) with full PHP compatibility and Apache/LiteSpeed SPA routing support.

---

## Architecture Overview

- **Frontend**: High-velocity React 19 Single Page Application (Vite + Tailwind CSS).
- **Routing Engine**: `.htaccess` URL Rewrite engine that routes all browser paths (`/courses`, `/student-dashboard`, `/settings`) to `index.html`, eliminating 404 errors on refresh.
- **Backend API**: Native PHP 8.x endpoints inside `/api/` (`health.php`, `contact.php`, `newsletter.php`, `courses.php`, `config.php`) with CORS, JSON payload parsing, and optional MySQL PDO connectivity.
- **Brand & Assets**: High-resolution SVG favicons and vector logos located in `/public`.

---

## Step 1: Build the Production Application

From your terminal or local workspace root, run:

```bash
npm run build
```

This compiles your application into the `dist/` directory. The build process automatically bundles:
- `dist/index.html` (Primary frontend entry)
- `dist/index.php` (PHP wrapper fallback for LiteSpeed/Apache)
- `dist/.htaccess` (SPA routing, Gzip compression, browser caching, and security headers)
- `dist/assets/` (Compiled, hashed JavaScript & CSS files)
- `dist/api/` (PHP API endpoints: `config.php`, `health.php`, `contact.php`, etc.)
- `dist/favicon.svg`, `dist/logo.svg`, `dist/logo-icon.svg`

---

## Step 2: Upload Files to Hostinger

### Method A: Hostinger hPanel File Manager (Easiest)

1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Navigate to **Websites** and click **Manage** next to your domain.
3. Under **Files**, open the **File Manager**.
4. Double-click the **`public_html`** directory.
5. If there is a default `default.php` or placeholder `index.html` from Hostinger, delete it.
6. Compress the contents of your local `dist/` folder into a `.zip` archive (e.g., `dist.zip`).
   > **Important**: Zip the *contents inside* the `dist/` folder, not the folder itself, so that `index.html` and `.htaccess` sit directly in `public_html/`.
7. In Hostinger File Manager, click **Upload** -> select `dist.zip`.
8. Right-click `dist.zip` and select **Extract** to the current directory (`public_html/`).
9. Delete the `dist.zip` file after extraction.

### Method B: FTP / SFTP (FileZilla)

1. In hPanel, go to **Files** -> **FTP Accounts**.
2. Note your FTP IP, Username, and Password.
3. Connect via FileZilla and open `/public_html/`.
4. Upload all files and folders directly from your local `dist/` directory into `/public_html/`.
5. Ensure hidden files are shown in FileZilla (`Server -> Force showing hidden files`) so that `.htaccess` is uploaded.

---

## Step 3: Verify PHP Configuration in Hostinger

1. In hPanel, navigate to **Advanced** -> **PHP Configuration**.
2. Select **PHP 8.1**, **PHP 8.2**, or **PHP 8.3**.
3. Under the **PHP Extensions** tab, ensure the following are enabled (usually active by default):
   - `pdo`
   - `pdo_mysql`
   - `curl`
   - `openssl`
   - `mbstring`
   - `json`
4. Click **Update** to save.

---

## Step 4: Test Your Live Deployment

Open your browser and verify:

1. **Main Application**:
   Visit `https://yourdomain.com` — the Yaswant Code LMS landing interface will load immediately with custom logo, fonts, and dark/light mode toggles.

2. **SPA Deep-Linking & Refresh Test**:
   Navigate to any internal view or refresh directly on a sub-route:
   - `https://yourdomain.com/courses`
   - `https://yourdomain.com/student-dashboard`
   - `https://yourdomain.com/tools`
   The `.htaccess` rewrite rules ensure that refreshing the page loads the application without a 404 error.

3. **PHP Health & Diagnostic Test**:
   Visit `https://yourdomain.com/api/health.php` in your browser. You will receive a clean JSON payload:
   ```json
   {
     "status": "ok",
     "platform": "Yaswant Code",
     "message": "Hostinger PHP compatibility runtime operational",
     "php_version": "8.2.x",
     "extensions": {
       "pdo": true,
       "pdo_mysql": true,
       "curl": true,
       "openssl": true
     }
   }
   ```

---

## Step 5: (Optional) Connect Hostinger MySQL Database

If you wish to store contact inquiries or course records in Hostinger's MySQL database:

1. In hPanel, go to **Databases** -> **MySQL Databases**.
2. Create a new database:
   - **Database Name**: e.g., `u123456789_lms`
   - **Username**: e.g., `u123456789_admin`
   - **Password**: `YourSecurePassword`
3. Edit `public_html/api/config.php` using Hostinger's File Manager text editor:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'u123456789_lms');
   define('DB_USER', 'u123456789_admin');
   define('DB_PASS', 'YourSecurePassword');
   ```
4. Inquiries submitted via `/api/contact.php` will automatically create the `inquiries` table and store records into MySQL.

---

## Troubleshooting Checklist

- **Issue: 404 on page reload**
  - Verify that the `.htaccess` file was uploaded to the root of `public_html/`. Because files starting with a dot (`.`) are hidden by default, ensure "Show hidden files (dotfiles)" is enabled in Hostinger File Manager settings.
- **Issue: White screen on initial load**
  - Check your browser's Developer Tools Console. Ensure all files in `assets/` were uploaded and that file permissions in Hostinger are set to `644` for files and `755` for directories.
- **Issue: SSL Certificate**
  - In hPanel, go to **Security** -> **SSL** and click **Install Free SSL** (Let's Encrypt) to enable HTTPS.
