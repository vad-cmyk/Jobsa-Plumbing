import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

const url   = process.argv[2] || 'http://localhost:3001';
const label = process.argv[3] || '';

const existing = fs.readdirSync(screenshotsDir)
  .map(f => { const m = f.match(/^screenshot-(\d+)/); return m ? parseInt(m[1]) : 0; });
const n = (existing.length ? Math.max(...existing) : 0) + 1;

const filename = label
  ? `screenshot-${n}-${label}.png`
  : `screenshot-${n}.png`;
const outPath = path.join(screenshotsDir, filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();
  console.log(`Screenshot saved: temporary screenshots/${filename}`);
})();
