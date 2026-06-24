import { readFileSync } from 'fs';

const TOKEN = readFileSync('C:/Users/Lucio/AppData/Local/Temp/token.txt', 'utf8').trim();
const ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YWlhcmt6anR4c3FzeWhkY3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNzQ1MTgsImV4cCI6MjA5Nzg1MDUxOH0.1eUsFk4uJndxB3u0YoS1TTZmq5Lzs4FwFzFEEFASSs8';

const USER_ID = '52bd3e36-45bc-4514-960a-be4c0fa6f302';
const items = [
  { user_id: USER_ID, name: 'Smart TV Samsung 55"', brand: 'Samsung', model: 'QN55Q80C', category: 'Electrónica', store: 'Frávega', price: 450000, purchase_date: '2024-03-15', warranty_months: 12, expiry_date: '2025-03-15' },
  { user_id: USER_ID, name: 'Heladera No Frost', brand: 'Whirlpool', model: 'WRB35AB', category: 'Electrodomésticos', store: 'Garbarino', price: 380000, purchase_date: '2024-06-01', warranty_months: 24, expiry_date: '2026-06-01' },
  { user_id: USER_ID, name: 'Notebook Lenovo IdeaPad', brand: 'Lenovo', model: 'IdeaPad 5', category: 'Informática', store: 'MercadoLibre', price: 750000, purchase_date: '2025-11-20', warranty_months: 12, expiry_date: '2026-11-20' },
  { user_id: USER_ID, name: 'iPhone 15 Pro', brand: 'Apple', model: 'A3292', category: 'Electrónica', store: 'iPoint', price: 1200000, purchase_date: '2025-12-01', warranty_months: 12, expiry_date: '2026-12-01' },
  { user_id: USER_ID, name: 'Microondas Orbis', brand: 'Orbis', model: 'OM30D', category: 'Electrodomésticos', store: 'Musimundo', price: 85000, purchase_date: '2026-05-15', warranty_months: 12, expiry_date: '2027-05-15' },
  { user_id: USER_ID, name: 'Lavarropas LG 8kg', brand: 'LG', model: 'WM2400', category: 'Electrodomésticos', store: 'Easy', price: 290000, purchase_date: '2024-01-10', warranty_months: 24, expiry_date: '2026-01-10' },
];

for (const item of items) {
  const res = await fetch('https://pyaiarkzjtxsqsyhdczw.supabase.co/rest/v1/warranties', {
    method: 'POST',
    headers: {
      'apikey': ANON,
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(item),
  });
  console.log(item.name, '->', res.status === 201 ? '✓' : await res.text());
}
