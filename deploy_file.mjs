import pkg from 'basic-ftp';
const { Client: FTPClient } = pkg;
import path from 'path';

const FTP_CONFIG = {
  host:     '82.25.125.43',
  port:     21,
  user:     'u865909543.yaswant.co.in',
  password: 'Yaswant739830#',
  secure:   false,
};

const localFile = process.argv[2];
const remotePath = process.argv[3];

if (!localFile || !remotePath) {
  console.error('Usage: node deploy_file.mjs <localFile> <remotePath>');
  process.exit(1);
}

async function run() {
  const client = new FTPClient(60000);
  try {
    console.log(`Connecting to FTP...`);
    await client.access(FTP_CONFIG);
    console.log(`Uploading ${localFile} -> ${remotePath}...`);
    await client.uploadFrom(localFile, remotePath);
    console.log(`Upload complete!`);
  } catch (err) {
    console.error(`Upload error:`, err);
    process.exit(1);
  } finally {
    client.close();
  }
}

run();
