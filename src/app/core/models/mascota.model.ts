export interface Mascota {
  id_mascota: number;
  id_usuario: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  peso_kg: number | string | null; // el back puede devolver el decimal como texto
  color: string | null;
  esterilizado: boolean;
  foto_url: string | null;
  fecha_registro: string | null;
}

/** Cuerpo de POST /mascotas/ y PUT /mascotas/{id} */
export interface MascotaRequest {
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  peso_kg: number | null;
  color: string | null;
  esterilizado: boolean;
  foto_url: string | null;
}
