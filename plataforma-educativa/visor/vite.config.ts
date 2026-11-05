import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErrorDbml, leerEsquema } from './src/esquema.ts';
import type { RespuestaEsquema } from './src/modelo.ts';

const aqui = path.dirname(fileURLToPath(import.meta.url));

/**
 * API local del visor:
 * - GET /api/esquema: el esquema ya leído con el parser oficial de DBML, o el error si no compila.
 *   El parser se queda aquí, en el servidor: en el navegador pesaría más de 17 MB.
 *   Cada vez que cambia el archivo, se avisa al navegador con el evento `esquema:cambio`.
 * - GET y PUT /api/posiciones: dónde está cada tabla y cada grupo en el diagrama.
 *   Se guarda junto al DBML, en `<nombre>.posiciones.json`.
 *
 * El archivo es `../esquema.dbml`, salvo que se indique otro con VISOR_DBML.
 */
function esquemaLocal(): Plugin {
  const dbml = path.resolve(process.env.VISOR_DBML ?? path.join(aqui, '..', 'esquema.dbml'));
  const posiciones = dbml.replace(/\.dbml$/, '') + '.posiciones.json';

  const responder = (res: Parameters<Connect.NextHandleFunction>[1], estado: number, cuerpo: unknown) => {
    res.statusCode = estado;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(cuerpo));
  };

  const leerCuerpo = (req: Connect.IncomingMessage) =>
    new Promise<string>((resolve, reject) => {
      let datos = '';
      req.on('data', (trozo) => (datos += trozo));
      req.on('end', () => resolve(datos));
      req.on('error', reject);
    });

  const api: Connect.NextHandleFunction = async (req, res, next) => {
    try {
      if (req.url === '/api/esquema' && req.method === 'GET') {
        const base = { archivo: path.basename(dbml), modificado: fs.statSync(dbml).mtimeMs };
        let respuesta: RespuestaEsquema;
        try {
          respuesta = { ...base, esquema: leerEsquema(fs.readFileSync(dbml, 'utf8')) };
        } catch (error) {
          if (!(error instanceof ErrorDbml)) throw error;
          respuesta = { ...base, error: error.aJson() };
        }
        return responder(res, 200, respuesta);
      }
      if (req.url === '/api/posiciones' && req.method === 'GET') {
        if (!fs.existsSync(posiciones)) return responder(res, 200, null);
        return responder(res, 200, JSON.parse(fs.readFileSync(posiciones, 'utf8')));
      }
      if (req.url === '/api/posiciones' && req.method === 'PUT') {
        const datos = JSON.parse(await leerCuerpo(req));
        fs.writeFileSync(posiciones, JSON.stringify(datos, null, 2) + '\n');
        return responder(res, 200, { ok: true });
      }
      next();
    } catch (error) {
      responder(res, 500, { error: String(error) });
    }
  };

  return {
    name: 'esquema-local',
    configureServer(server) {
      server.middlewares.use(api);
      server.watcher.add(dbml);
      server.watcher.on('change', (archivo) => {
        if (path.resolve(archivo) === dbml) server.ws.send({ type: 'custom', event: 'esquema:cambio' });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), esquemaLocal()],
  server: { port: 5200, strictPort: true },
});
