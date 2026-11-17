export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Cita {
  id_cita: number;
  id_mascota: number;
  id_veterinario: number | null;
  fecha_hora: string;
  motivo: string | null;
  estado: EstadoCita;
  fecha_creacion: string | null;
}

/** Cuerpo de POST /citas/ (el back deja el estado en 'pendiente') */
export interface CitaRequest {
  id_mascota: number;
  id_veterinario: number | null;
  fecha_hora: string;
  motivo: string | null;
}

/** Cuerpo de PUT /citas/{id}: el cliente solo reprograma, no cambia el estado */
export interface CitaUpdateRequest {
  id_veterinario: number | null;
  fecha_hora: string;
  motivo: string | null;
}
