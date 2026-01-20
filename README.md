## Tech-challenge

### Objetivo

Este repo contiene:

- **MySQL en Docker** (setup local)
- Un proyecto **Laravel** en `url-short/` (instalación base)

### Setup desde cero (local)

```bash
git clone <repo>
cd Tech-challenge
```

1) **Levanta MySQL en Docker** (sección siguiente)
2) **Configura y corre Laravel** (sección “Laravel”)

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

### Laravel (`url-short/`)

#### 1) Entra al proyecto

```bash
cd url-short
```

#### 2) Variables de entorno (MySQL)

- Para el repo, el archivo de referencia es **`.env.example`**
- En tu máquina, el que se usa al correr Laravel es **`.env`**

**IMPORTANTE (PRODUCCIÓN): NO HAGAS PUSH/COMMIT DE CREDENCIALES REALES EN ARCHIVOS `.env` / `.env.example`.**
**EN ESTA PRUEBA TÉCNICA SE DEJAN VALORES DE EJEMPLO ÚNICAMENTE PARA DEJAR CLARO CÓMO ES LA CONEXIÓN.**
**EN UN PROYECTO REAL, ESTOS VALORES DEBEN VENIR DE VARIABLES DE ENTORNO DEL RUNTIME/CI-CD (POR EJEMPLO GITHUB ACTIONS SECRETS, UN SECRET MANAGER, ETC.).**

Desde `url-short/`:

```bash
cp .env.example .env
```

En ambos archivos, deja configurado MySQL así:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dev_db
DB_USERNAME=dev_user
DB_PASSWORD=dev_password
```

#### 3) Aplicar cambios + migraciones

```bash
php artisan config:clear
php artisan migrate
```

#### 4) Correr en desarrollo

```bash
composer run dev
```
