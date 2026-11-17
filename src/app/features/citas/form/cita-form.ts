import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CitasService } from '../../../core/services/citas.service';
import { MascotasService } from '../../../core/services/mascotas.service';
import { DirectorioService } from '../../../core/services/directorio.service';
import { Mascota } from '../../../core/models/mascota.model';
import { Clinica, Veterinario } from '../../../core/models/directorio.model';
import { mensajeError } from '../../../core/http-error';
import { ahoraLocalISO, vacioANull } from '../../../shared/utils';

@Component({
  selector: 'app-cita-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cita-form.html'
})
export class CitaForm implements OnInit {
  private fb = inject(FormBuilder);
  private citasSrv = inject(CitasService);
  private mascotasSrv = inject(MascotasService);
  private directorio = inject(DirectorioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** null = crear; número = reprogramar */
  idCita: number | null = null;

  mascotas = signal<Mascota[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  clinicas = signal<Clinica[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);

  readonly minimo = ahoraLocalISO();

  form = this.fb.group({
    id_mascota: this.fb.control<number | null>(null, Validators.required),
    id_veterinario: this.fb.control<number | null>(null),
    fecha_hora: this.fb.nonNullable.control('', Validators.required),
    motivo: this.fb.nonNullable.control('')
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.idCita = id ? Number(id) : null;

    forkJoin({
      mascotas: this.mascotasSrv.listar(),
      veterinarios: this.directorio.veterinarios(),
      clinicas: this.directorio.clinicas()
    }).subscribe({
      next: (r) => {
        this.mascotas.set(r.mascotas);
        this.veterinarios.set(r.veterinarios);
        this.clinicas.set(r.clinicas);

        if (this.idCita === null) {
          // Si venimos de la ficha de una mascota, la dejamos seleccionada
          const pre = Number(this.route.snapshot.queryParamMap.get('mascota'));
          if (pre && r.mascotas.some(m => m.id_mascota === pre)) {
            this.form.controls.id_mascota.setValue(pre);
          }
          this.cargando.set(false);
        } else {
          this.cargarCita(this.idCita);
        }
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar el formulario'));
        this.cargando.set(false);
      }
    });
  }

  private cargarCita(id: number): void {
    this.citasSrv.obtener(id).subscribe({
      next: (c) => {
        this.form.patchValue({
          id_mascota: c.id_mascota,
          id_veterinario: c.id_veterinario,
          fecha_hora: c.fecha_hora.slice(0, 16),
          motivo: c.motivo ?? ''
        });
        this.form.controls.id_mascota.disable(); // el back no permite cambiar la mascota de una cita
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar la cita'));
        this.cargando.set(false);
      }
    });
  }

  nombreClinica(id: number): string {
    return this.clinicas().find(c => c.id_clinica === id)?.nombre ?? '';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idCita === null
      ? this.citasSrv.crear({
          id_mascota: v.id_mascota as number,
          id_veterinario: v.id_veterinario,
          fecha_hora: v.fecha_hora,
          motivo: vacioANull(v.motivo)
        })
      : this.citasSrv.actualizar(this.idCita, {
          id_veterinario: v.id_veterinario,
          fecha_hora: v.fecha_hora,
          motivo: vacioANull(v.motivo)
        });

    peticion.subscribe({
      next: () => this.router.navigate(['/citas']),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la cita'));
        this.guardando.set(false);
      }
    });
  }

  invalido(campo: 'id_mascota' | 'fecha_hora'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}
