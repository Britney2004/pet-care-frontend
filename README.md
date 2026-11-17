# PeludOS – Front (Angular, rol cliente)

Front del proyecto PeludOS. **No modifica el back**: habla con la API de `pet-care-backend`
a través de `/api` (proxy en desarrollo, nginx en Docker), así que no hay problemas de CORS.

## Qué incluye
- Registro (con inicio de sesión automático) e inicio de sesión
- Inicio con resumen: mascotas, citas próximas y vacunas por vencer
- Mi perfil: ver, editar y desactivar cuenta
- Mascotas: listar, crear, editar y eliminar; ficha con historial médico y vacunas (CRUD)
- Citas: agendar, reprogramar, cancelar y eliminar
- Directorio de clínicas y veterinarios (solo lectura)

No incluye cambio ni recuperación de contraseña: el back no tiene esos endpoints.

## Desarrollo (recomendado)
1. Levanta el back:  `cd ../pet-care-backend && docker compose up -d`  (API en el puerto 8000)
2. En esta carpeta:
   ```
   npm install
   npm start
   ```
3. Abre http://localhost:4200

## Con Docker
```
docker compose up --build
```
Abre http://localhost:4200. El contenedor se conecta a `peludos_api` por la red del back.
Si el nombre de la red es distinto, cámbialo en `docker-compose.yml` (`docker network ls`).
