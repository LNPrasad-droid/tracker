import type { IncomingMessage, ServerResponse } from 'node:http';
import mysql from 'mysql2/promise';

const readJsonBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Content-Type', 'application/json');

  if (request.method !== 'POST') {
    response.statusCode = 405;
    response.end(JSON.stringify({ connected: false, message: 'Method not allowed.' }));
    return;
  }

  try {
    const body = await readJsonBody(request);
    const defaultHost = process.env.VITE_MYSQL_HOST || '127.0.0.1:3306';
    const [envHost, envPort = '3306'] = defaultHost.split(':');
    const database = body.database || process.env.VITE_MYSQL_DATABASE || undefined;

    const connection = await mysql.createConnection({
      host: body.host || envHost,
      port: Number(body.port || envPort),
      user: body.user || process.env.VITE_MYSQL_USER || 'root',
      password: body.password || process.env.VITE_MYSQL_PASSWORD || '',
      database,
      connectTimeout: 5000,
    });

    const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS databaseName');
    await connection.end();

    const result = Array.isArray(rows) ? rows[0] as { version?: string; databaseName?: string } : {};
    response.statusCode = 200;
    response.end(JSON.stringify({
      connected: true,
      message: 'MySQL authentication succeeded.',
      serverVersion: result.version,
      database: result.databaseName || database,
      checkedAt: new Date().toISOString(),
    }));
  } catch (error) {
    response.statusCode = 200;
    response.end(JSON.stringify({
      connected: false,
      message: error instanceof Error ? error.message : 'MySQL connection failed.',
      checkedAt: new Date().toISOString(),
    }));
  }
}
