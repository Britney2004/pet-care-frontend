import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DirectorioService } from '../../core/services/directorio.service';
import { Clinica, Veterinario } from '../../core/models/directorio.model';
import { mensajeError } from '../../core/http-error';

@Component({
  selector: 'app-directorio',
  templateUrl: './directorio.html'
})
export class Directorio implements OnInit {
  private srv = inject(DirectorioService);

  clinicas = signal<Clinica[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  busqueda = signal('');

  filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.clinicas();
    return this.clinicas().filter(c =>
      c.nombre.toLowerCase().includes(q) || (c.ciudad ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    forkJoin({
      clinicas: this.srv.clinicas(),
      veterinarios: this.srv.veterinarios()
    }).subscribe({
      next: (r) => {
        this.clinicas.set(r.clinicas);
        this.veterinarios.set(r.veterinarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar el directorio'));
        this.cargando.set(false);
      }
    });
  }

  vetsDe(idClinica: number): Veterinario[] {
    return this.veterinarios().filter(v => v.id_clinica === idClinica);
  }
}
