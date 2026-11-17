/** Texto vacío -> null (el back no acepta '' en fechas ni en campos opcionales). */
export function vacioANull(v: string | null | undefined): string | null {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
}

/** Fecha de hoy en formato YYYY-MM-DD (hora local). */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Fecha y hora actual para <input type="datetime-local">. */
export function ahoraLocalISO(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hoyISO()}T${hh}:${mm}`;
}

export function edadTexto(fecha: string | null): string {
  if (!fecha) return 'Edad no registrada';
  const nac = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses--;
  if (meses < 0) return 'Fecha inválida';
  if (meses < 1) return 'Menos de 1 mes';
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

export function emojiEspecie(especie: string): string {
  const e = especie.toLowerCase();
  if (e.includes('perr') || e.includes('can')) return '🐶';
  if (e.includes('gat') || e.includes('fel')) return '🐱';
  if (e.includes('ave') || e.includes('loro') || e.includes('canario')) return '🦜';
  if (e.includes('conej')) return '🐰';
  if (e.includes('roed') || e.includes('hamst') || e.includes('cobay')) return '🐹';
  if (e.includes('rept') || e.includes('tortug') || e.includes('igua')) return '🦎';
  return '🐾';
}

export function nombreVeterinario(v: { nombre: string; apellido: string }): string {
  return `${v.nombre} ${v.apellido}`;
}
