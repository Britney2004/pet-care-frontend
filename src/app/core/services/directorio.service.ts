import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Clinica, Veterinario } from '../models/directorio.model';

@Injectable({ providedIn: 'root' })
export class DirectorioService {
  private http = inject(HttpClient);

  clinicas(): Observable<Clinica[]> {
    return this.http.get<Clinica[]>(`${API_URL}/clinicas/`);
  }
  veterinarios(): Observable<Veterinario[]> {
    return this.http.get<Veterinario[]>(`${API_URL}/veterinarios/`);
  }
}
