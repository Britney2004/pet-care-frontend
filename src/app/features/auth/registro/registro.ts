import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegistroRequest } from '../../../core/models/usuario.model';
import { mensajeError } from '../../../core/http-error';
import { vacioANull } from '../../../shared/utils';

const coinciden: ValidatorFn = (grupo) =>
  grupo.get('contrasena')?.value === grupo.get('confirmar')?.value ? null : { noCoinciden: true };

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      nombre_completo: ['', [Validators.required, Validators.maxLength(100)]],
      correo_electronico: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', Validators.maxLength(20)],
      direccion: [''],
      // bcrypt solo admite hasta 72 caracteres
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
      confirmar: ['', Validators.required]
    },
    { validators: coinciden }
  );

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos: RegistroRequest = {
      nombre_completo: v.nombre_completo.trim(),
      correo_electronico: v.correo_electronico.trim(),
      contrasena: v.contrasena,
      telefono: vacioANull(v.telefono),
      direccion: vacioANull(v.direccion)
    };

    this.cargando.set(true);
    this.error.set(null);

    this.auth.registrar(datos).subscribe({
      next: () => {
        // Cuenta creada: iniciamos sesión automáticamente
        this.auth.login({ correo: datos.correo_electronico, contrasena: datos.contrasena }).subscribe({
          next: () => this.router.navigate(['/inicio']),
          error: () => this.router.navigate(['/login'])
        });
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo crear la cuenta'));
        this.cargando.set(false);
      }
    });
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  noCoinciden(): boolean {
    return this.form.hasError('noCoinciden') && this.form.controls.confirmar.touched;
  }
}
