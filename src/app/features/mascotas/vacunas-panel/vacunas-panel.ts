import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SaludService } from '../../../core/services/salud.service';
import { DirectorioService } from '../../../core/services/directorio.service';
import { Vacuna } from '../../../core/models/salud.model';
import { Veterinario } from '../../../core/models/directorio.model';
import { mensajeError } from '../../../core/http-error';
import { hoyISO, nombreVeterinario, vacioANull } from '../../../shared/utils';

@Component({
  selector: 'app-vacunas-panel',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './vacunas-panel.html'
})
export class VacunasPanel implements OnInit {
  idMascota = input.required<number>();

  private fb = inject(FormBuilder);
  private salud = inject(SaludService);
  private directorio = inject(DirectorioService);

  vacunas = signal<Vacuna[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);

  mostrandoForm = signal(false);
  editandoId = signal<number | null>(null);

  readonly hoy = hoyISO();

  form = this.fb.nonNullable.group({
    nombre_vacuna: ['', [Validators.required, Validators.maxLength(100)]],
    fecha_aplicacion: [hoyISO(), Validators.required],
    fecha_proxima_dosis: [''],
    id_veterinario: this.fb.control<number | null>(null),
    lote: ['']
  });

  ngOnInit(): void {
    forkJoin({
      vacunas: this.salud.vacunasDeMascota(this.idMascota()),
      veterinarios: this.directorio.veterinarios()
    }).subscribe({
      next: (r) => {
        this.vacunas.set(r.vacunas);
        this.veterinarios.set(r.veterinarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudieron cargar las vacunas'));
        this.cargando.set(false);
      }
    });
  }

  nombreVet(id: number | null): string {
    if (id === null) return 'Sin veterinario';
    const v = this.veterinarios().find(x => x.id_veterinario === id);
    return v ? nombreVeterinario(v) : `Veterinario #${id}`;
  }

  /** 'vencida' si el refuerzo ya pasó, 'pronto' si vence en 30 días, null en otro caso. */
  estadoRefuerzo(v: Vacuna): 'vencida' | 'pronto' | null {
    if (!v.fecha_proxima_dosis) return null;
    const hoy = hoyISO();
    if (v.fecha_proxima_dosis < hoy) return 'vencida';
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);
    const limiteISO = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, '0')}-${String(limite.getDate()).padStart(2, '0')}`;
    return v.fecha_proxima_dosis <= limiteISO ? 'pronto' : null;
  }

  nueva(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre_vacuna: '', fecha_aplicacion: hoyISO(), fecha_proxima_dosis: '', id_veterinario: null, lote: '' });
    this.error.set(null);
    this.mostrandoForm.set(true);
  }

  editar(v: Vacuna): void {
    this.editandoId.set(v.id_vacuna);
    this.form.reset({
      nombre_vacuna: v.nombre_vacuna,
      fecha_aplicacion: v.fecha_aplicacion,
      fecha_proxima_dosis: v.fecha_proxima_dosis ?? '',
      id_veterinario: v.id_veterinario,
      lote: v.lote ?? ''
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

    const f = this.form.getRawValue();
    const base = {
      id_veterinario: f.id_veterinario,
      nombre_vacuna: f.nombre_vacuna.trim(),
      fecha_aplicacion: f.fecha_aplicacion,
      fecha_proxima_dosis: vacioANull(f.fecha_proxima_dosis),
      lote: vacioANull(f.lote)
    };

    if (base.fecha_proxima_dosis && base.fecha_proxima_dosis < base.fecha_aplicacion) {
      this.error.set('La próxima dosis no puede ser anterior a la fecha de aplicación');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const id = this.editandoId();
    const peticion = id === null
      ? this.salud.crearVacuna({ id_mascota: this.idMascota(), ...base })
      : this.salud.actualizarVacuna(id, base);

    peticion.subscribe({
      next: (v) => {
        this.vacunas.update(lista => {
          const resto = lista.filter(x => x.id_vacuna !== v.id_vacuna);
          return [...resto, v].sort((a, b) => b.fecha_aplicacion.localeCompare(a.fecha_aplicacion));
        });
        this.guardando.set(false);
        this.cancelar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la vacuna'));
        this.guardando.set(false);
      }
    });
  }

  eliminar(v: Vacuna): void {
    if (!confirm(`¿Eliminar la vacuna "${v.nombre_vacuna}"?`)) return;

    this.error.set(null);
    this.salud.eliminarVacuna(v.id_vacuna).subscribe({
      next: () => this.vacunas.update(lista => lista.filter(x => x.id_vacuna !== v.id_vacuna)),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo eliminar la vacuna'))
    });
  }
}
