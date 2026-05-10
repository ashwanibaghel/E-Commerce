import { execute, insertOnUpdate } from '@evershop/postgres-query-builder';
import { mkdir } from 'fs/promises';
import path from 'path';
import { migrate } from '../packages/evershop/dist/bin/lib/bootstrap/migrate.js';
import { getCoreModules } from '../packages/evershop/dist/bin/lib/loadModules.js';
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

await mkdir(path.resolve(process.cwd(), 'media'), { recursive: true });
await mkdir(path.resolve(process.cwd(), 'public'), { recursive: true });

const connection = await pool.connect();

try {
  await execute(connection, 'CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await migrate(getCoreModules(), connection);

  await insertOnUpdate('admin_user', ['email'])
    .given({
      status: 1,
      email: adminEmail,
      password: hashPassword(adminPassword),
      full_name: adminFullName
    })
    .execute(connection);

  console.log(`Render setup completed. Admin user ready: ${adminEmail}`);
} finally {
  connection.release();
  await pool.end();
}
