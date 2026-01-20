## Tech-challenge

### Objetivo

Este repo (por ahora) contiene **solo el setup de base de datos** para el challenge.

### Base de datos (MySQL en Docker)

Este es el **único apartado de Docker** en este proyecto por el momento.

#### Modo IA (recomendado)

- Abre `AGENT_DOCKER_MYSQL.md`
- **Copia y pega su contenido completo** en el chat de tu agente/IA (por ejemplo, en Cursor)

Ese documento es un **runbook para agentes**: la IA ejecuta lo necesario (sin preguntarte nada) para **levantar y validar** MySQL.

#### Modo manual (sin IA)

```bash
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml logs --tail=120 mysql
```

#### Archivos relevantes

- **Runbook para IA**: `AGENT_DOCKER_MYSQL.md`
- **Docker Compose**: `docker/docker-compose.yml`
- **Init SQL**: `docker/init.sql`
