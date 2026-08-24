"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
exports.default = (0, config_1.defineConfig)({
    schema: 'prisma/schema.prisma',
    datasource: { url: process.env.DIRECT_URL || (0, config_1.env)('DATABASE_URL') },
    migrations: {
        seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
});
//# sourceMappingURL=prisma.config.js.map