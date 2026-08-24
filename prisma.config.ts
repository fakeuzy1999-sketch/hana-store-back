import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 saca la URL del schema: vive aqui y en el adaptador del cliente.
// Se lee con process.env y no con env() a proposito: en el build de Render
// `prisma generate` corre sin necesidad de base, y env() reventaria si falta.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Neon: migrar exige la conexion directa, no el pooler.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || '' },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
