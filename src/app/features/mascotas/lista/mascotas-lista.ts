import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MascotasService } from '../../../core/services/mascotas.service';
import { Mascota } from '../../../core/models/mascota.model';
import { mensajeError } from '../../../core/http-error';
import { edadTexto, emojiEspecie } from '../../../shared/utils';

@Component({
  selector: 'app-mascotas-lista',
  imports: [RouterLink],
  templateUrl: './mascotas-lista.html'
})
export class MascotasLista implements OnInit {
  private srv = inject(MascotasService);

  mascotas = signal<Mascota[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  readonly edadTexto = edadTexto;
  readonly emojiEspecie = emojiEspecie;

  ngOnInit(): void {
    this.srv.listar().subscribe({
      next: (m) => {
        this.mascotas.set(m);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudieron cargar tus mascotas'));
        this.cargando.set(false);
      }
    });
  }

  eliminar(m: Mascota): void {
    if (!confirm(`¿Eliminar a ${m.nombre}? También se borrarán sus citas, historial y vacunas.`)) return;

    this.error.set(null);
    this.srv.eliminar(m.id_mascota).subscribe({
      next: () => this.mascotas.update(lista => lista.filter(x => x.id_mascota !== m.id_mascota)),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo eliminar la mascota'))
    });
  }
}
