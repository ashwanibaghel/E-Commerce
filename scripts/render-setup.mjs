import { execute, insertOnUpdate, select } from '@evershop/postgres-query-builder';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { migrate } from '../packages/evershop/dist/bin/lib/bootstrap/migrate.js';
import { getCoreModules } from '../packages/evershop/dist/bin/lib/loadModules.js';
import { seedAttributeGroup, seedAttributes } from '../packages/evershop/dist/bin/seed/seedAttributes.js';
import { seedCategories } from '../packages/evershop/dist/bin/seed/seedCategories.js';
import { seedCollections } from '../packages/evershop/dist/bin/seed/seedCollections.js';
import { seedPages } from '../packages/evershop/dist/bin/seed/seedPages.js';
import { seedProducts } from '../packages/evershop/dist/bin/seed/seedProducts.js';
import { seedWidgets } from '../packages/evershop/dist/bin/seed/seedWidgets.js';
import { pool } from '../packages/evershop/dist/lib/postgres/connection.js';
import { hashPassword } from '../packages/evershop/dist/lib/util/passwordHelper.js';

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length) {
  throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
}

const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
const adminFullName = process.env.ADMIN_FULLNAME || 'Ashwani Baghel';

const demoImages = [
  ['smartview-55.svg', 'SmartView 55 4K TV', '#151515', '#d6a93a'],
  ['coolair-ac.svg', 'CoolAir Inverter AC', '#f8fafc', '#d6a93a'],
  ['galaxy-phone.svg', 'GalaxyPro 5G Phone', '#111827', '#d6a93a'],
  ['airbook-laptop.svg', 'AirBook Pro Laptop', '#1f2937', '#d6a93a'],
  ['gamebox-console.svg', 'GameBox X Console', '#0f172a', '#d6a93a'],
  ['soundbar.svg', 'CineSound Bar', '#18181b', '#d6a93a'],
  ['smartwatch.svg', 'FitTrack Watch', '#111827', '#d6a93a'],
  ['headphones.svg', 'BassMax Headphones', '#171717', '#d6a93a'],
  ['camera.svg', 'SecureCam 360', '#f9fafb', '#d6a93a'],
  ['printer.svg', 'PrintMate Laser', '#f8fafc', '#d6a93a'],
  ['router.svg', 'MeshLink Router', '#111827', '#d6a93a'],
  ['mixer.svg', 'ChefPro Mixer', '#faf7ef', '#d6a93a']
];

const createDemoImage = (title, background, accent) => `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="glow" cx="50%" cy="28%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity=".38"/>
      <stop offset="55%" stop-color="${background}" stop-opacity=".95"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>
  <rect width="900" height="900" rx="54" fill="url(#glow)"/>
  <rect x="122" y="122" width="656" height="656" rx="42" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/>
  <circle cx="450" cy="405" r="168" fill="#0b0b0b" fill-opacity=".72" stroke="${accent}" stroke-width="5"/>
  <rect x="312" y="518" width="276" height="28" rx="14" fill="${accent}" fill-opacity=".88"/>
  <rect x="360" y="566" width="180" height="14" rx="7" fill="${accent}" fill-opacity=".55"/>
  <text x="450" y="735" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#fff">${title}</text>
  <text x="450" y="779" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="4" fill="${accent}">BAGHEL DIGITAL</text>
</svg>`;

async function ensureDemoImages() {
  const imageDir = path.resolve(process.cwd(), 'media', 'demo-electronics');
  await mkdir(imageDir, { recursive: true });
  await Promise.all(
    demoImages.map(([filename, title, background, accent]) =>
      writeFile(path.join(imageDir, filename), createDemoImage(title, background, accent))
    )
  );
}

async function seedDemoDataIfNeeded() {
  const flagshipProduct = await select()
    .from('product')
    .where('sku', '=', 'BD-TV-55-4K')
    .load(pool);

  if (flagshipProduct) {
    console.log('Baghel electronics demo product exists. Syncing any missing demo data...');
  } else {
    console.log('Baghel electronics demo data missing. Seeding catalog demo data...');
  }
  await ensureDemoImages();
  const demoAttributeGroupId = await seedAttributeGroup();
  await seedAttributes(demoAttributeGroupId);
  await seedCategories();
  await seedCollections();
  await seedProducts(demoAttributeGroupId);
  await seedWidgets();
  await seedPages();
  console.log('Baghel electronics demo data sync completed.');
}

await mkdir(path.resolve(process.cwd(), 'media'), { recursive: true });
await mkdir(path.resolve(process.cwd(), 'public'), { recursive: true });

let exitCode = 0;

try {
  await execute(pool, 'CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await migrate(getCoreModules());

  await insertOnUpdate('admin_user', ['email'])
    .given({
      status: 1,
      email: adminEmail,
      password: hashPassword(adminPassword),
      full_name: adminFullName
    })
    .execute(pool);

  await insertOnUpdate('setting', ['name'])
    .given({ name: 'codPaymentStatus', value: '1', is_json: 0 })
    .execute(pool);
  await insertOnUpdate('setting', ['name'])
    .given({ name: 'codDisplayName', value: 'Cash on Delivery', is_json: 0 })
    .execute(pool);

  await seedDemoDataIfNeeded();

  console.log(`Render setup completed. Admin user ready: ${adminEmail}`);
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await Promise.race([
    pool.end().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 1000))
  ]);
  process.exit(exitCode);
}
