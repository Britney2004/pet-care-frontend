import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MascotasService } from '../../core/services/mascotas.service';
import { CitasService } from '../../core/services/citas.service';
import { SaludService } from '../../core/services/salud.service';
import { Mascota } from '../../core/models/mascota.model';
import { Cita } from '../../core/models/cita.model';
import { Vacuna } from '../../core/models/salud.model';
import { mensajeError } from '../../core/http-error';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, DatePipe],
  templateUrl: './inicio.html'
})
export class Inicio implements OnInit {
  auth = inject(AuthService);
  private mascotasSrv = inject(MascotasService);
  private citasSrv = inject(CitasService);
  private saludSrv = inject(SaludService);

  cargando = signal(true);
  error = signal<string | null>(null);
  mascotas = signal<Mascota[]>([]);
  citas = signal<Cita[]>([]);
  vacunas = signal<Vacuna[]>([]);

  /** Próximas 3 citas (pendientes o confirmadas, de hoy en adelante). */
  proximasCitas = computed(() => {
    const ahora = Date.now();
    return this.citas()
      .filter(c => (c.estado === 'pendiente' || c.estado === 'confirmada')
        && new Date(c.fecha_hora).getTime() >= ahora)
      .slice(0, 3);
  });

  ngOnInit(): void {
    forkJoin({
      mascotas: this.mascotasSrv.listar(),
      citas: this.citasSrv.listar(),
      vacunas: this.saludSrv.proximasVacunas(30)
    }).subscribe({
      next: (r) => {
        this.mascotas.set(r.mascotas);
        this.citas.set(r.citas);
        this.vacunas.set(r.vacunas);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar tu información'));
        this.cargando.set(false);
      }
    });
  }

  nombreMascota(id: number): string {
    return this.mascotas().find(m => m.id_mascota === id)?.nombre ?? `Mascota #${id}`;
  }
}
