import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { mensajeError } from '../../core/http-error';
import { vacioANull } from '../../shared/utils';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './perfil.html'
})
export class Perfil implements OnInit {
  auth = inject(AuthService);
  private usuarios = inject(UsuarioService);
  private fb = inject(FormBuilder);

  guardando = signal(false);
  exito = signal<string | null>(null);
  error = signal<string | null>(null);

  confirmando = signal(false);
  desactivando = signal(false);
  errorCuenta = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombre_completo: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', Validators.maxLength(20)],
    direccion: ['']
  });

  ngOnInit(): void {
    const u = this.auth.usuario();
    if (u) {
      this.form.patchValue({
        nombre_completo: u.nombre_completo,
        telefono: u.telefono ?? '',
        direccion: u.direccion ?? ''
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.exito.set(null);
    this.error.set(null);

    this.usuarios.actualizarPerfil({
      nombre_completo: v.nombre_completo.trim(),
      telefono: vacioANull(v.telefono),
      direccion: vacioANull(v.direccion)
    }).subscribe({
      next: () => {
        this.exito.set('Perfil actualizado');
        this.guardando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo actualizar el perfil'));
        this.guardando.set(false);
      }
    });
  }

  desactivar(): void {
    this.desactivando.set(true);
    this.errorCuenta.set(null);

    this.usuarios.desactivar().subscribe({
      next: () => this.auth.cerrarSesion(),
      error: (err) => {
        this.errorCuenta.set(mensajeError(err, 'No se pudo desactivar la cuenta'));
        this.desactivando.set(false);
      }
    });
  }

  invalido(campo: 'nombre_completo' | 'telefono'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}
