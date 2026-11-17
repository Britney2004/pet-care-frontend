import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api.config';
import { ActualizarPerfilRequest, Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  /** PATCH /usuarios/me */
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API_URL}/usuarios/me`, datos).pipe(
      tap(usuario => this.auth.establecerUsuario(usuario))
    );
  }

  /** DELETE /usuarios/me (desactiva la cuenta) */
  desactivar(): Observable<Usuario> {
    return this.http.delete<Usuario>(`${API_URL}/usuarios/me`);
  }
}
