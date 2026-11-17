import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Mascota, MascotaRequest } from '../models/mascota.model';

@Injectable({ providedIn: 'root' })
export class MascotasService {
  private http = inject(HttpClient);

  // Ojo: las rutas de lista/creación llevan "/" final; sin ella FastAPI redirige y el navegador bloquea.
  listar(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${API_URL}/mascotas/`);
  }
  obtener(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${API_URL}/mascotas/${id}`);
  }
  crear(datos: MascotaRequest): Observable<Mascota> {
    return this.http.post<Mascota>(`${API_URL}/mascotas/`, datos);
  }
  actualizar(id: number, datos: MascotaRequest): Observable<Mascota> {
    return this.http.put<Mascota>(`${API_URL}/mascotas/${id}`, datos);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/mascotas/${id}`);
  }
}
