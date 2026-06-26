import { chromium } from 'playwright';

const BASE       = 'http://localhost:3002';
const OUT        = 'C:/Users/Lucio/garantias-app/public/screenshots';
const TEST_EMAIL = 'screenshot_1782311018757@demo.com';
const TEST_PASS  = 'Demo1234!';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// Login
await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', TEST_EMAIL);
await page.fill('input[type="password"]', TEST_PASS);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
console.log('✓ Logged in');

// Formulario con botón escanear visible
await page.goto(`${BASE}/garantias/nueva`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);

// Scroll a la sección de archivos
await page.evaluate(() => {
  const el = document.querySelector('h2[class*="font-semibold"]:last-of-type');
  el?.scrollIntoView({ behavior: 'instant', block: 'center' });
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/scanner-button.png`, fullPage: true });
console.log('✓ scanner-button.png (full page)');

// Screenshot recortado de la sección de archivos
const section = await page.locator('div.bg-white.border').nth(2);
await section.screenshot({ path: `${OUT}/scanner-section.png` });
console.log('✓ scanner-section.png');

await browser.close();
console.log('Done');
