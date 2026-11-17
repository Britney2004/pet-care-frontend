export interface Historial {
  id_historial: number;
  id_mascota: number;
  id_veterinario: number | null;
  id_cita: number | null;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  peso_kg: number | string | null;
  observaciones: string | null;
}

/** POST /historial/ (crear) */
export interface HistorialCreateRequest {
  id_mascota: number;
  id_veterinario: number | null;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  peso_kg: number | null;
  observaciones: string | null;
}

/** PUT /historial/{id} (el back no permite cambiar la mascota) */
export type HistorialUpdateRequest = Omit<HistorialCreateRequest, 'id_mascota'>;

export interface Vacuna {
  id_vacuna: number;
  id_mascota: number;
  id_veterinario: number | null;
  nombre_vacuna: string;
  fecha_aplicacion: string;
  fecha_proxima_dosis: string | null;
  lote: string | null;
}

/** POST /vacunas/ (crear) */
export interface VacunaCreateRequest {
  id_mascota: number;
  id_veterinario: number | null;
  nombre_vacuna: string;
  fecha_aplicacion: string;
  fecha_proxima_dosis: string | null;
  lote: string | null;
}

/** PUT /vacunas/{id} */
export type VacunaUpdateRequest = Omit<VacunaCreateRequest, 'id_mascota'>;
