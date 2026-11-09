require('dotenv/config');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

// L'adapter accetta direttamente la stringa mysql:// di DATABASE_URL
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

module.exports = new PrismaClient({ adapter });
