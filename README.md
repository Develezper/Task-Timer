# Task Timer

Aplicacion web para crear tareas, iniciarlas, finalizarlas y medir el tiempo invertido en cada una usando MongoDB.

## Caracteristicas

- Crear tareas con estado inicial `pending`
- Iniciar una tarea y actualizar el contador cada segundo
- Finalizar tareas y conservar el tiempo total
- Eliminar tareas
- Persistencia completa con MongoDB
- Interfaz responsive con tarjetas reutilizables

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB

## Ejecutar en local

```bash
bun install
bun run dev
```

Antes de iniciar, crea un archivo `.env.local` basado en `.env.example`.

Abre `http://localhost:3000`.

## Scripts

```bash
bun run dev
bun run lint
bun run build
```

## Estructura principal

```text
src/
├── app/
├── components/
│   ├── Card.tsx
│   └── tasks/
├── types/
```

## Despliegue

El proyecto esta listo para desplegarse en Vercel configurando `MONGODB_URI` y `MONGODB_DB`.
