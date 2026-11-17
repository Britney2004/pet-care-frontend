import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import {
  Historial, HistorialCreateRequest, HistorialUpdateRequest,
  Vacuna, VacunaCreateRequest, VacunaUpdateRequest
} from '../models/salud.model';

@Injectable({ providedIn: 'root' })
export class SaludService {
  private http = inject(HttpClient);

  // ----- Historial médico -----
  historialDeMascota(idMascota: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${API_URL}/historial/mascota/${idMascota}`);
  }
  crearHistorial(datos: HistorialCreateRequest): Observable<Historial> {
    return this.http.post<Historial>(`${API_URL}/historial/`, datos);
  }
  actualizarHistorial(id: number, datos: HistorialUpdateRequest): Observable<Historial> {
    return this.http.put<Historial>(`${API_URL}/historial/${id}`, datos);
  }
  eliminarHistorial(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/historial/${id}`);
  }

  // ----- Vacunas -----
  vacunasDeMascota(idMascota: number): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${API_URL}/vacunas/mascota/${idMascota}`);
  }
  proximasVacunas(dias = 30): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${API_URL}/vacunas/proximas`, { params: { dias } });
  }
  crearVacuna(datos: VacunaCreateRequest): Observable<Vacuna> {
    return this.http.post<Vacuna>(`${API_URL}/vacunas/`, datos);
  }
  actualizarVacuna(id: number, datos: VacunaUpdateRequest): Observable<Vacuna> {
    return this.http.put<Vacuna>(`${API_URL}/vacunas/${id}`, datos);
  }
  eliminarVacuna(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/vacunas/${id}`);
  }
}
