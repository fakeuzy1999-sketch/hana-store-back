import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 saca la URL del schema: vive aqui y en el adaptador del cliente.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Neon: las migraciones necesitan la conexion directa, no el pooler.
  datasource: { url: process.env.DIRECT_URL || env('DATABASE_URL') },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
