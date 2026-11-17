import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Cita, CitaRequest, CitaUpdateRequest } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitasService {
  private http = inject(HttpClient);

  listar(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API_URL}/citas/`);
  }
  obtener(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${API_URL}/citas/${id}`);
  }
  crear(datos: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${API_URL}/citas/`, datos);
  }
  actualizar(id: number, datos: CitaUpdateRequest): Observable<Cita> {
    return this.http.put<Cita>(`${API_URL}/citas/${id}`, datos);
  }
  cancelar(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${API_URL}/citas/${id}/cancelar`, {});
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/citas/${id}`);
  }
}
