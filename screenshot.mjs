import { chromium } from 'playwright';

const BASE        = 'http://localhost:3000';
const OUT         = 'C:/Users/Lucio/garantias-app/public/screenshots';
const TEST_EMAIL  = 'screenshot_1782311018757@demo.com';
const TEST_PASS   = 'Demo1234!';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// Login page (mostrando email de ejemplo)
await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'usuario@ejemplo.com');
await page.screenshot({ path: `${OUT}/login.png` });
console.log('✓ login.png');

// Register page
await page.goto(`${BASE}/register`);
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'usuario@ejemplo.com');
await page.fill('input[placeholder="Mínimo 6 caracteres"]', 'MiClave123!');
await page.fill('input[placeholder="••••••••"]', 'MiClave123!');
await page.screenshot({ path: `${OUT}/register.png` });
console.log('✓ register.png');

// Login con usuario de prueba
await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', TEST_EMAIL);
await page.fill('input[type="password"]', TEST_PASS);
await page.click('button[type="submit"]');

await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
await page.waitForLoadState('networkidle');
console.log('✓ Logged in');

// Dashboard
await page.screenshot({ path: `${OUT}/dashboard.png` });
console.log('✓ dashboard.png');

// Lista en grilla
await page.goto(`${BASE}/garantias`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/lista.png` });
console.log('✓ lista.png');

// Lista en modo tabla
const listBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(2);
await listBtn.click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/lista-tabla.png` });
console.log('✓ lista-tabla.png');

// Formulario nueva garantía
await page.goto(`${BASE}/garantias/nueva`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${OUT}/formulario.png` });
console.log('✓ formulario.png');

await browser.close();
console.log('All done!');
