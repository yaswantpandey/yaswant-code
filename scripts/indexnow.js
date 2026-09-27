import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'yaswant.co.in';
const KEY = '495b30ababbd4d1cbcf4ea4d0c7fa3e4';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Read sitemap.xml to extract URLs
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
let urls = [
  `https://${HOST}/`,
  `https://${HOST}/courses`,
  `https://${HOST}/blog`,
  `https://${HOST}/roadmaps`,
  `https://${HOST}/projects`,
  `https://${HOST}/tools`,
  `https://${HOST}/resources`,
  `https://${HOST}/community`
];

try {
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const matches = [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)];
    if (matches.length > 0) {
      urls = [...new Set(matches.map(m => m[1].trim()))];
    }
  }
} catch (err) {
  console.warn('Could not parse sitemap.xml, using default URL list:', err);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls
};

const endpoints = [
  'https://www.bing.com/indexnow',
  'https://api.indexnow.org/indexnow'
];

async function submitIndexNow() {
  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing)...`);
  console.log(`Host: ${HOST}`);
  console.log(`Key: ${KEY}`);
  console.log(`KeyLocation: ${KEY_LOCATION}`);

  for (const endpoint of endpoints) {
    try {
      console.log(`\nSending request to: ${endpoint}`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log(`Response: ${res.status} ${res.statusText}`);
      if (res.status === 200 || res.status === 202) {
        console.log(`✔ Successfully submitted URLs to ${endpoint}`);
      } else {
        const text = await res.text();
        console.warn(`⚠ ${endpoint} returned: ${text}`);
      }
    } catch (err) {
      console.error(`✖ Failed to send to ${endpoint}:`, err);
    }
  }
}

submitIndexNow();
