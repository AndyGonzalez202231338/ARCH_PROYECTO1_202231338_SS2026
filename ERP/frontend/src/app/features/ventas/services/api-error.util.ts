import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/venta.model';

/**
 * Extrae el `message` del ErrorResponse del backend.
 * Si la respuesta vino como Blob (caso de descargarFactura con
 * responseType:'blob'), no se puede leer de forma síncrona, por lo que
 * se devuelve el mensaje por defecto.
 */
export function mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
  const cuerpo = err.error as ErrorResponse | string | null | undefined;
  if (typeof cuerpo === 'string' && cuerpo.trim()) return cuerpo;
  if (cuerpo && typeof cuerpo === 'object' && 'message' in cuerpo && cuerpo.message) {
    return cuerpo.message;
  }
  return porDefecto;
}
