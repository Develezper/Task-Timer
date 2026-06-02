# Task Timer

Aplicacion web para crear tareas, iniciarlas, finalizarlas y medir el tiempo invertido en cada una.

## Caracteristicas

- Crear tareas con estado inicial `pending`
- Iniciar una tarea y actualizar el contador cada segundo
- Finalizar tareas y conservar el tiempo total
- Eliminar tareas
- Persistencia completa con `localStorage`
- Interfaz responsive con tarjetas reutilizables

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
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

El proyecto esta listo para desplegarse en Vercel.
