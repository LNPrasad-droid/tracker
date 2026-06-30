import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import mysql from 'mysql2/promise';

const parseJsonBody = async (request: import('node:http').IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const databaseStatusPlugin = (env: Record<string, string>): Plugin => ({
  name: 'database-status-api',
  configureServer(server) {
    server.middlewares.use('/api/database/status', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ connected: false, message: 'Method not allowed.' }));
        return;
      }

      try {
        const body = await parseJsonBody(request);
        const database = body.database || env.VITE_MYSQL_DATABASE || undefined;
        const connection = await mysql.createConnection({
          host: body.host || env.VITE_MYSQL_HOST?.split(':')[0] || '127.0.0.1',
          port: Number(body.port || env.VITE_MYSQL_HOST?.split(':')[1] || 3306),
          user: body.user || env.VITE_MYSQL_USER || 'root',
          password: body.password || env.VITE_MYSQL_PASSWORD || '',
          database,
          connectTimeout: 5000,
        });

        const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS databaseName');
        await connection.end();

        const result = Array.isArray(rows) ? rows[0] as { version?: string; databaseName?: string } : {};
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
          connected: true,
          message: 'MySQL authentication succeeded.',
          serverVersion: result.version,
          database: result.databaseName || database,
          checkedAt: new Date().toISOString(),
        }));
      } catch (error) {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
          connected: false,
          message: error instanceof Error ? error.message : 'MySQL connection failed.',
          checkedAt: new Date().toISOString(),
        }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [databaseStatusPlugin(env), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
