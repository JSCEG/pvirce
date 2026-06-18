# Plan completo: Tanda Mundialista mobile-first

## Alcance funcional

La app debe servir para una quiniela/tanda interna del Mundial en oficina:

- Registro de usuarios con nombre, correo y área.
- Configuración de monto de entrada, fecha límite de pago y reglas de puntos.
- Equipos con bandera, grupo, país, confederación y estado de clasificación.
- Calendario oficial de partidos, fase, sede, hora local y resultados.
- Captura de pronósticos por usuario antes del cierre de cada partido.
- Tabla de posiciones automática por puntos.
- Panel de administrador para resultados, pagos, participantes y avisos.
- Notificaciones por correo, push web o canal interno cuando haya resultados, cambios de ranking o pronósticos pendientes.

## Datos del Mundial

Fuente recomendada: mantener un catálogo propio y actualizarlo contra el calendario oficial de FIFA. Al 7 de junio de 2026, FIFA publica el calendario del Mundial 2026 con 104 partidos, sedes y fases en su sitio oficial. La app inicial usa datos demo para no depender de scraping frágil.

Fuentes de referencia:

- FIFA: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
- Anuncio de calendario FIFA: https://inside.fifa.com/news/updated-world-cup-2026-match-schedule-now-available

## Modelo de datos

Tablas mínimas:

- `users`: id, name, email, department, role, created_at.
- `pools`: id, name, entry_fee, currency, rules_json, status.
- `pool_members`: pool_id, user_id, paid_at, payment_status.
- `teams`: code, name, flag, group_name, confederation.
- `matches`: id, stage, date_time, venue, home_team, away_team, home_score, away_score, status.
- `predictions`: user_id, match_id, predicted_home, predicted_away, locked_at.
- `notifications`: user_id, type, title, body, sent_at, read_at.

## Reglas de puntos

Regla inicial:

- Marcador exacto: 5 puntos.
- Ganador o empate correcto: 3 puntos.
- Diferencia correcta: 1 punto.
- Sin pronóstico o pronóstico tardío: 0 puntos.

Se recomienda que las reglas vivan en `pools.rules_json` para cambiarlas sin tocar código.

## Arquitectura recomendada

Fase 1, piloto rápido:

- Frontend estático en HTML/CSS/JS.
- Persistencia temporal en `localStorage`.
- Uso interno para validar flujo y reglas.

Fase 2, multiusuario real:

- Frontend: React, Vue o vanilla modular, desplegado en Cloudflare Pages.
- Backend: Supabase o Cloudflare Workers + D1.
- Auth: Supabase Auth con correo corporativo o magic link.
- Base de datos: Postgres si se usa Supabase; D1 si se prefiere Cloudflare nativo.
- Notificaciones: email transaccional y Web Push.
- Tareas programadas: job diario para recordar pronósticos pendientes.

Fase 3, operación oficina:

- Panel admin con carga CSV de partidos/resultados.
- Exportación de ranking a PDF/CSV.
- Auditoría de cambios de resultados y pronósticos.
- Reglas de desempate: exactos, aciertos de ganador, menor tiempo de captura, sorteo.

## Seguridad y control

- No guardar contraseñas en frontend.
- Usar auth por magic link o SSO corporativo.
- Validar cierre de pronósticos en backend, no solo en navegador.
- Roles: `admin`, `capturista`, `participante`.
- Restringir resultados y configuración a admins.
- Registrar auditoría: quién cambió resultado, cuándo y valor anterior.

## Despliegue

Piloto estático:

1. Subir carpeta `mundial-tanda/` a Cloudflare Pages, GitHub Pages o servidor interno.
2. Build command: vacío.
3. Output directory: `mundial-tanda`.
4. Compartir URL interna.

Producción con Supabase + Cloudflare Pages:

1. Crear proyecto Supabase.
2. Crear tablas del modelo de datos.
3. Activar Auth con dominio corporativo permitido.
4. Configurar variables en Cloudflare Pages:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Implementar Row Level Security:
   - Participantes leen partidos y su propio pronóstico.
   - Admins leen y editan todo.
6. Desplegar frontend.
7. Configurar job de recordatorios y notificaciones.

## Roadmap de implementación

1. Prototipo visual y flujo local.
2. Importador de calendario oficial por CSV.
3. Auth real.
4. Base de datos y reglas de puntos en servidor.
5. Panel admin completo.
6. Notificaciones por correo/push.
7. Pruebas con 10-20 usuarios de oficina.
8. Ajuste de reglas y despliegue general.

## Criterios de aceptación

- Una persona puede registrarse desde celular.
- El administrador fija monto y reglas.
- Cada usuario captura pronósticos por partido.
- Al capturar resultados, la tabla se recalcula sola.
- La app muestra bolsa acumulada y pagos.
- Las notificaciones avisan resultados y pendientes.
- La app funciona correctamente en pantalla de 360 px de ancho.
