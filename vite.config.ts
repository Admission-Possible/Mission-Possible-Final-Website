import { defineConfig, loadEnv } from 'vite';
import type { Plugin, Connect } from 'vite';
import react from '@vitejs/plugin-react';
import { Readable } from 'node:stream';
import { handleJoin } from './api/join.ts';

// The same handler is used locally and on Vercel; preview never fakes delivery.
function localIntake(): Plugin {
  const middleware = (server: { middlewares: { use: (handler: Connect.NextHandleFunction) => void } }) => {
    server.middlewares.use(async (req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/join') return next();
      try {
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        const init = {
          method: req.method,
          headers,
          ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
        } as RequestInit;
        const response = await handleJoin(new Request(`http://${req.headers.host ?? 'localhost:5173'}/api/join`, init));
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      } catch {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'We could not send your application. Please try again.' }));
      }
    });
  };
  return { name: 'local-intake', configureServer: middleware, configurePreviewServer: middleware };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['RESEND_API_KEY', 'JOIN_NOTIFY_EMAIL', 'JOIN_FROM_EMAIL'])
    if (env[key]) process.env[key] = env[key];
  return { plugins: [react(), localIntake()], server: { host: '127.0.0.1', port: 5173, strictPort: true } };
});
