import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MascotasService } from '../../../core/services/mascotas.service';
import { MascotaRequest } from '../../../core/models/mascota.model';
import { mensajeError } from '../../../core/http-error';
import { hoyISO, vacioANull } from '../../../shared/utils';

@Component({
  selector: 'app-mascota-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mascota-form.html'
})
export class MascotaForm implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(MascotasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** null = crear; número = editar */
  idMascota: number | null = null;

  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  readonly hoy = hoyISO();
  readonly especies = ['Perro', 'Gato', 'Ave', 'Conejo', 'Roedor', 'Reptil'];

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    especie: ['', [Validators.required, Validators.maxLength(50)]],
    raza: [''],
    sexo: [''],
    fecha_nacimiento: [''],
    peso_kg: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(999)]),
    color: [''],
    esterilizado: [false],
    foto_url: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.idMascota = Number(id);
    this.cargando.set(true);
    this.srv.obtener(this.idMascota).subscribe({
      next: (m) => {
        this.form.patchValue({
          nombre: m.nombre,
          especie: m.especie,
          raza: m.raza ?? '',
          sexo: m.sexo ?? '',
          fecha_nacimiento: m.fecha_nacimiento ?? '',
          peso_kg: m.peso_kg === null ? null : Number(m.peso_kg),
          color: m.color ?? '',
          esterilizado: m.esterilizado,
          foto_url: m.foto_url ?? ''
        });
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo cargar la mascota'));
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos: MascotaRequest = {
      nombre: v.nombre.trim(),
      especie: v.especie.trim(),
      raza: vacioANull(v.raza),
      sexo: vacioANull(v.sexo),
      fecha_nacimiento: vacioANull(v.fecha_nacimiento),
      peso_kg: v.peso_kg,
      color: vacioANull(v.color),
      esterilizado: v.esterilizado,
      foto_url: vacioANull(v.foto_url)
    };

    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idMascota === null
      ? this.srv.crear(datos)
      : this.srv.actualizar(this.idMascota, datos);

    peticion.subscribe({
      next: (m) => this.router.navigate(['/mascotas', m.id_mascota]),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la mascota'));
        this.guardando.set(false);
      }
    });
  }

  invalido(campo: 'nombre' | 'especie' | 'peso_kg'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}
