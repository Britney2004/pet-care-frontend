import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SaludService } from '../../../core/services/salud.service';
import { DirectorioService } from '../../../core/services/directorio.service';
import { Historial } from '../../../core/models/salud.model';
import { Veterinario } from '../../../core/models/directorio.model';
import { mensajeError } from '../../../core/http-error';
import { hoyISO, nombreVeterinario, vacioANull } from '../../../shared/utils';

@Component({
  selector: 'app-historial-panel',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './historial-panel.html'
})
export class HistorialPanel implements OnInit {
  idMascota = input.required<number>();

  private fb = inject(FormBuilder);
  private salud = inject(SaludService);
  private directorio = inject(DirectorioService);

  registros = signal<Historial[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);

  mostrandoForm = signal(false);
  editandoId = signal<number | null>(null);

  readonly hoy = hoyISO();

  form = this.fb.nonNullable.group({
    fecha: [hoyISO(), Validators.required],
    id_veterinario: this.fb.control<number | null>(null),
    diagnostico: [''],
    tratamiento: [''],
    peso_kg: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(999)]),
    observaciones: ['']
  });

  ngOnInit(): void {
    forkJoin({
      registros: this.salud.historialDeMascota(this.idMascota()),
      veterinarios: this.directorio.veterinarios()
    }).subscribe({
      next: (r) => {
        this.registros.set(r.registros);
        this.veterinarios.set(r.veterinarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar el historial'));
        this.cargando.set(false);
      }
    });
  }

  nombreVet(id: number | null): string {
    if (id === null) return 'Sin veterinario';
    const v = this.veterinarios().find(x => x.id_veterinario === id);
    return v ? nombreVeterinario(v) : `Veterinario #${id}`;
  }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ fecha: hoyISO(), id_veterinario: null, diagnostico: '', tratamiento: '', peso_kg: null, observaciones: '' });
    this.error.set(null);
    this.mostrandoForm.set(true);
  }

  editar(h: Historial): void {
    this.editandoId.set(h.id_historial);
    this.form.reset({
      fecha: h.fecha,
      id_veterinario: h.id_veterinario,
      diagnostico: h.diagnostico ?? '',
      tratamiento: h.tratamiento ?? '',
      peso_kg: h.peso_kg === null ? null : Number(h.peso_kg),
      observaciones: h.observaciones ?? ''
    });
    this.error.set(null);
    this.mostrandoForm.set(true);
  }

  cancelar(): void {
    this.mostrandoForm.set(false);
    this.editandoId.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const base = {
      id_veterinario: v.id_veterinario,
      fecha: v.fecha,
      diagnostico: vacioANull(v.diagnostico),
      tratamiento: vacioANull(v.tratamiento),
      peso_kg: v.peso_kg,
      observaciones: vacioANull(v.observaciones)
    };

    this.guardando.set(true);
    this.error.set(null);

    const id = this.editandoId();
    const peticion = id === null
      ? this.salud.crearHistorial({ id_mascota: this.idMascota(), ...base })
      : this.salud.actualizarHistorial(id, base);

    peticion.subscribe({
      next: (h) => {
        this.registros.update(lista => {
          const resto = lista.filter(x => x.id_historial !== h.id_historial);
          return [...resto, h].sort((a, b) => b.fecha.localeCompare(a.fecha));
        });
        this.guardando.set(false);
        this.cancelar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el registro'));
        this.guardando.set(false);
      }
    });
  }

  eliminar(h: Historial): void {
    if (!confirm('¿Eliminar este registro del historial?')) return;

    this.error.set(null);
    this.salud.eliminarHistorial(h.id_historial).subscribe({
      next: () => this.registros.update(lista => lista.filter(x => x.id_historial !== h.id_historial)),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo eliminar el registro'))
    });
  }
}
