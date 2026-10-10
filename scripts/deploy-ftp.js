import * as ftp from 'basic-ftp';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env if present
dotenv.config({ path: path.join(rootDir, '.env') });

const host = process.env.FTP_SERVER || 'ftpupload.net';
const user = process.env.FTP_USERNAME;
const password = process.env.FTP_PASSWORD;
const port = parseInt(process.env.FTP_PORT || '21', 10);
const remoteDir = process.env.FTP_REMOTE_DIR || 'yaswant.co.in/htdocs/';
const localDistDir = path.join(rootDir, 'dist');

async function deploy() {
  console.log('====================================================');
  console.log('🚀 Yaswant Code — InfinityFree FTP Deployer');
  console.log('====================================================');
  console.log(`📡 Host:       ${host}:${port}`);
  console.log(`👤 Username:   ${user || '(not set)'}`);
  console.log(`📁 Target Dir: ${remoteDir}`);
  console.log('----------------------------------------------------');

  if (!user || !password) {
    console.error('❌ Error: FTP_USERNAME or FTP_PASSWORD missing!');
    console.error('Please configure your FTP credentials in .env:');
    console.error('  FTP_SERVER=ftpupload.net');
    console.error('  FTP_USERNAME=your_infinityfree_username (e.g. if0_xxxxxxxx)');
    console.error('  FTP_PASSWORD=your_infinityfree_password');
    console.error('  FTP_REMOTE_DIR=yaswant.co.in/htdocs/');
    process.exit(1);
  }

  if (!fs.existsSync(path.join(localDistDir, 'index.html'))) {
    console.error('❌ Error: dist/ directory not found or index.html is missing!');
    console.error('Please run "npm run build" before deploying.');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔌 Connecting to FTP server...');
    await client.access({
      host,
      user,
      password,
      port,
      secure: false
    });

    console.log(`📂 Ensuring remote directory: ${remoteDir}`);
    await client.ensureDir(remoteDir);

    console.log(`⬆️  Uploading files from ${localDistDir} to ${remoteDir}...`);
    await client.uploadFromDir(localDistDir);

    console.log('----------------------------------------------------');
    console.log('✅ Deployment successful! Your site is live.');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ FTP Deployment failed:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
