import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 saca la URL del schema: vive aqui y en el adaptador del cliente.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
