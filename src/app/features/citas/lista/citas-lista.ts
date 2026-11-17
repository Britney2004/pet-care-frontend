import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CitasService } from '../../../core/services/citas.service';
import { MascotasService } from '../../../core/services/mascotas.service';
import { DirectorioService } from '../../../core/services/directorio.service';
import { Cita } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { Veterinario } from '../../../core/models/directorio.model';
import { mensajeError } from '../../../core/http-error';
import { nombreVeterinario } from '../../../shared/utils';

@Component({
  selector: 'app-citas-lista',
  imports: [RouterLink, DatePipe],
  templateUrl: './citas-lista.html'
})
export class CitasLista implements OnInit {
  private citasSrv = inject(CitasService);
  private mascotasSrv = inject(MascotasService);
  private directorio = inject(DirectorioService);

  citas = signal<Cita[]>([]);
  mascotas = signal<Mascota[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  filtroEstado = signal('');
  filtroMascota = signal(0); // 0 = todas

  filtradas = computed(() =>
    this.citas().filter(c =>
      (this.filtroEstado() === '' || c.estado === this.filtroEstado()) &&
      (this.filtroMascota() === 0 || c.id_mascota === this.filtroMascota())
    )
  );

  ngOnInit(): void {
    forkJoin({
      citas: this.citasSrv.listar(),
      mascotas: this.mascotasSrv.listar(),
      veterinarios: this.directorio.veterinarios()
    }).subscribe({
      next: (r) => {
        this.citas.set(r.citas);
        this.mascotas.set(r.mascotas);
        this.veterinarios.set(r.veterinarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudieron cargar tus citas'));
        this.cargando.set(false);
      }
    });
  }

  nombreMascota(id: number): string {
    return this.mascotas().find(m => m.id_mascota === id)?.nombre ?? `Mascota #${id}`;
  }

  nombreVet(id: number | null): string {
    if (id === null) return 'Sin veterinario asignado';
    const v = this.veterinarios().find(x => x.id_veterinario === id);
    return v ? nombreVeterinario(v) : `Veterinario #${id}`;
  }

  /** Solo se puede cancelar o reprogramar una cita pendiente o confirmada. */
  esActiva(c: Cita): boolean {
    return c.estado === 'pendiente' || c.estado === 'confirmada';
  }

  cancelar(c: Cita): void {
    if (!confirm('¿Cancelar esta cita?')) return;

    this.error.set(null);
    this.citasSrv.cancelar(c.id_cita).subscribe({
      next: (act) => this.citas.update(lista => lista.map(x => x.id_cita === act.id_cita ? act : x)),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo cancelar la cita'))
    });
  }

  eliminar(c: Cita): void {
    if (!confirm('¿Eliminar esta cita definitivamente?')) return;

    this.error.set(null);
    this.citasSrv.eliminar(c.id_cita).subscribe({
      next: () => this.citas.update(lista => lista.filter(x => x.id_cita !== c.id_cita)),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo eliminar la cita'))
    });
  }
}
