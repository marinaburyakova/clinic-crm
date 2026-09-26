# Deployment Notes — Prisma 7 + Docker

## Критические моменты

### 1. `prisma generate` — внутри Dockerfile
Движки Prisma должны генерироваться на той же архитектуре, что и конечный образ.
Multi-stage Dockerfile: generate в builder stage.

### 2. `DATABASE_URL` при `next build`
Next.js build пробует подключаться к БД.
Для сборки — dummy URL. Реальный — через env контейнера.

```dockerfile
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
RUN npm run build