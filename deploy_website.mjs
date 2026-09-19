/**
 * Deploy Yaswant Code built web app & API to Hostinger FTP
 */
import pkg from 'basic-ftp';
const { Client: FTPClient } = pkg;
import fs from 'fs';
import path from 'path';

const FTP_CONFIG = {
  host:     '82.25.125.43',
  port:     21,
  user:     'u865909543.yaswant.co.in',
  password: 'Yaswant739830#',
  secure:   false,
};

const DIST_DIR = path.resolve('dist');

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function uploadFile(client, localPath, remotePath) {
  const stat = fs.statSync(localPath);
  const sizeKB = (stat.size / 1024).toFixed(1);
  log(`⬆️ Uploading ${path.basename(localPath)} (${sizeKB} KB) -> ${remotePath}...`);
  await client.uploadFrom(localPath, remotePath);
  log(`✅ Uploaded: ${path.basename(localPath)}`);
}

async function deploy() {
  const client = new FTPClient(60000);
  client.ftp.verbose = false;

  try {
    log('🚀 Starting deployment to Hostinger...');
    await client.access(FTP_CONFIG);
    log('✅ Connected to Hostinger FTP server.');

    // 1. Upload assets
    const assetsDir = path.join(DIST_DIR, 'assets');
    if (fs.existsSync(assetsDir)) {
      log('📁 Ensuring /public_html/assets directory...');
      await client.ensureDir('/public_html/assets');
      const assetFiles = fs.readdirSync(assetsDir);
      for (const file of assetFiles) {
        const localFilePath = path.join(assetsDir, file);
        if (fs.statSync(localFilePath).isFile()) {
          await uploadFile(client, localFilePath, `/public_html/assets/${file}`);
        }
      }
    }

    // 2. Upload root static files (index.html, sitemap.xml, robots.txt, .htaccess, icons)
    const rootFiles = [
      'index.html',
      'sitemap.xml',
      'robots.txt',
      'og-image.svg',
      '.htaccess',
      'favicon.svg',
      'logo.svg',
      'logo-icon.svg'
    ];

    for (const file of rootFiles) {
      const localFilePath = path.join(DIST_DIR, file);
      if (fs.existsSync(localFilePath)) {
        await uploadFile(client, localFilePath, `/public_html/${file}`);
      } else {
        log(`⚠️ Skipping missing root file: ${file}`);
      }
    }

    // 3. Upload API endpoints to /public_html/api/
    const apiDir = path.join(DIST_DIR, 'api');
    if (fs.existsSync(apiDir)) {
      log('📁 Ensuring /public_html/api directory...');
      await client.ensureDir('/public_html/api');
      const apiFiles = fs.readdirSync(apiDir);
      for (const file of apiFiles) {
        // We skip overwriting config.php if it exists to preserve any server-specific env/db logic,
        // though config.php uses .env. Let's upload all active endpoints.
        const localFilePath = path.join(apiDir, file);
        if (fs.statSync(localFilePath).isFile()) {
          await uploadFile(client, localFilePath, `/public_html/api/${file}`);
        }
      }
    }

    log('🎉 Deployment to Hostinger completed successfully!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
