export interface Clinica {
  id_clinica: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  ciudad: string | null;
}

export interface Veterinario {
  id_veterinario: number;
  id_clinica: number;
  nombre: string;
  apellido: string;
  especialidad: string | null;
  telefono: string | null;
  email: string | null;
}
