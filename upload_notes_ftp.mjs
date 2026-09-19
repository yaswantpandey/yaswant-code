/**
 * Upload Engineering Notes PDFs to Hostinger /public_html/notes/
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

const LOCAL_NOTES_DIR = 'C:\\Users\\lucifer\\OneDrive\\Desktop\\ENGINEERING NOTES';
const REMOTE_NOTES_DIR = '/public_html/notes';

const FILES_MAP = [
  { local: 'Android_CompleteNotes.pdf', remote: 'Android_CompleteNotes.pdf' },
  { local: 'btech DSUC-Notes-1.pdf',    remote: 'btech_DSUC_Notes_1.pdf' },
  { local: 'Cloud_Computing Notes.pdf',  remote: 'Cloud_Computing_Notes.pdf' },
  { local: 'C_Complete_Notes.pdf',      remote: 'C_Complete_Notes.pdf' },
  { local: 'data science handbook.pdf',  remote: 'data_science_handbook.pdf' },
  { local: 'DSA_CompleteNotes.pdf',     remote: 'DSA_CompleteNotes.pdf' },
  { local: 'Java_Complete_Notes.pdf',   remote: 'Java_Complete_Notes.pdf' },
  { local: 'JS_Chapterwise_Notes.pdf',  remote: 'JS_Chapterwise_Notes.pdf' },
  { local: 'Python_Complete_Notes.pdf', remote: 'Python_Complete_Notes.pdf' },
];

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function uploadAll() {
  const client = new FTPClient(60000); // 60s timeout for large chunks
  client.ftp.verbose = false;

  try {
    log('Connecting to Hostinger FTP...');
    await client.access(FTP_CONFIG);
    log('Connected successfully.');

    await client.ensureDir(REMOTE_NOTES_DIR);
    log(`Target directory confirmed: ${REMOTE_NOTES_DIR}`);

    // Check what already exists on the server to allow resume/skip if already complete
    const existingList = await client.list(REMOTE_NOTES_DIR);
    const existingMap = new Map(existingList.map(item => [item.name, item.size]));

    for (const item of FILES_MAP) {
      const localFile = path.join(LOCAL_NOTES_DIR, item.local);
      if (!fs.existsSync(localFile)) {
        log(`❌ Local file not found: ${localFile}`);
        continue;
      }

      const stat = fs.statSync(localFile);
      const remoteSize = existingMap.get(item.remote);

      if (remoteSize === stat.size) {
        log(`⏭️  Already uploaded with exact size (${(stat.size / 1024 / 1024).toFixed(1)} MB): ${item.remote}`);
        continue;
      }

      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      log(`⬆️  Uploading ${item.remote} (${sizeMB} MB)...`);

      let lastPercent = 0;
      client.trackProgress(info => {
        const percent = Math.floor((info.bytes / stat.size) * 100);
        if (percent >= lastPercent + 25) {
          lastPercent = percent;
          log(`   Progress [${item.remote}]: ${percent}% (${(info.bytes / 1024 / 1024).toFixed(1)} / ${sizeMB} MB)`);
        }
      });

      let attempts = 0;
      let uploaded = false;
      while (!uploaded && attempts < 3) {
        try {
          attempts++;
          await client.uploadFrom(localFile, `${REMOTE_NOTES_DIR}/${item.remote}`);
          uploaded = true;
          log(`✅ Completed: ${item.remote}`);
        } catch (err) {
          log(`⚠️ Error on attempt ${attempts}/3 for ${item.remote}: ${err.message}`);
          if (attempts >= 3) throw err;
          // Reconnect
          try {
            await client.access(FTP_CONFIG);
            await client.ensureDir(REMOTE_NOTES_DIR);
          } catch {}
        }
      }
      client.trackProgress(); // clear tracker
    }

    log('🎉 All engineering note files uploaded successfully!');
  } catch (err) {
    console.error('Upload failed with error:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

uploadAll();
