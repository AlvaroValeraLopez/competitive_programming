import type { PosicionesGuardadas } from './disposicion.ts';
import type { RespuestaEsquema } from './modelo.ts';

export async function pedirEsquema(): Promise<RespuestaEsquema> {
  const respuesta = await fetch('/api/esquema');
  if (!respuesta.ok) throw new Error(`No se pudo leer el esquema (${respuesta.status})`);
  return respuesta.json();
}

export async function pedirPosiciones(): Promise<PosicionesGuardadas | null> {
  const respuesta = await fetch('/api/posiciones');
  return respuesta.ok ? respuesta.json() : null;
}

export async function guardarPosiciones(posiciones: PosicionesGuardadas): Promise<void> {
  await fetch('/api/posiciones', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(posiciones),
  });
}
