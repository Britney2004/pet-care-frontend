import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MascotasService } from '../../../core/services/mascotas.service';
import { Mascota } from '../../../core/models/mascota.model';
import { mensajeError } from '../../../core/http-error';
import { edadTexto, emojiEspecie } from '../../../shared/utils';
import { HistorialPanel } from '../historial-panel/historial-panel';
import { VacunasPanel } from '../vacunas-panel/vacunas-panel';

@Component({
  selector: 'app-mascota-detalle',
  imports: [RouterLink, DatePipe, HistorialPanel, VacunasPanel],
  templateUrl: './mascota-detalle.html'
})
export class MascotaDetalle implements OnInit {
  private srv = inject(MascotasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mascota = signal<Mascota | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pestana = signal<'historial' | 'vacunas'>('historial');

  readonly edadTexto = edadTexto;
  readonly emojiEspecie = emojiEspecie;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.srv.obtener(id).subscribe({
      next: (m) => {
        this.mascota.set(m);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar la mascota'));
        this.cargando.set(false);
      }
    });
  }

  eliminar(): void {
    const m = this.mascota();
    if (!m) return;
    if (!confirm(`¿Eliminar a ${m.nombre}? También se borrarán sus citas, historial y vacunas.`)) return;

    this.srv.eliminar(m.id_mascota).subscribe({
      next: () => this.router.navigate(['/mascotas']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo eliminar la mascota'))
    });
  }
}
