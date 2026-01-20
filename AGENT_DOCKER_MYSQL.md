# AGENT_DOCKER_MYSQL.md

Este archivo es un **runbook para agentes/IA**. Si el usuario te pega este MD en el chat, **NO preguntes nada**: ejecuta los pasos abajo en orden hasta dejar MySQL arriba y validado.

## Datos “fuente de verdad” (según `docker/docker-compose.yml`)

- **Archivo compose**: `docker/docker-compose.yml`
- **Servicio**: `mysql`
- **Container name**: `mysql_dev`
- **Host**: `127.0.0.1`
- **Puerto**: `3306`
- **Database**: `dev_db`
- **Usuario**: `dev_user`
- **Password**: `dev_password`
- **Root password**: `rootpassword`

## Objetivo (resultado esperado)

- `docker compose -f docker/docker-compose.yml ps` muestra `mysql_dev` en estado **Up**.
- Logs contienen **“ready for connections”**.
- Smoke test:
  - `mysqladmin ping` responde **`mysqld is alive`**
  - `dev_user` puede ejecutar `SELECT 1` en `dev_db`
  - `root` puede listar bases y aparece `dev_db`

## Pre-requisitos (si falla, es por esto)

- Docker Desktop instalado y **corriendo**.
- Docker Compose v2 disponible como `docker compose`.

> Nota para agentes que corren en entornos “sandbox”: si Docker falla por permisos al escribir en `~/.docker` o por acceso al socket `docker.sock`, solicita permisos elevados (equivalente a “all”) y reintenta.

## Procedimiento automático (idempotente): revisar → levantar si hace falta → validar

### 1) Revisar si ya está levantado

Ejecuta:

```bash
docker compose -f docker/docker-compose.yml ps
```

- Si `mysql_dev` ya está **Up**, pasa directo a “Validación”.
- Si no está Up (o no existe), continúa con “Levantar”.

### 2) Levantar (build + up)

> Si ya existe la imagen local, `build` será rápido. Si no existe, descargará `mysql:8.0`.

```bash
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
```

Luego revisa logs recientes:

```bash
docker compose -f docker/docker-compose.yml logs --tail=120 mysql
```

### 3) Validación (smoke test obligatorio)

#### 3.1 Esperar a que MySQL responda

```bash
for i in $(seq 1 30); do
  docker exec mysql_dev mysqladmin -uroot -prootpassword ping --silent && break
  sleep 1
done
```

Debe imprimir `mysqld is alive`.

#### 3.2 Probar login con `dev_user` (contra `dev_db`)

```bash
docker exec -i mysql_dev mysql -u dev_user -pdev_password dev_db -e "SELECT 1 AS ok;"
```

Debe devolver una fila con `ok = 1`.

#### 3.3 Probar login con `root`

```bash
docker exec -i mysql_dev mysql -u root -prootpassword -e "SHOW DATABASES;"
```

Debe listar `dev_db` entre otras (`mysql`, `performance_schema`, etc.).

## Conectar desde la máquina host (cliente externo)

- **Host**: `127.0.0.1`
- **Port**: `3306`
- **DB**: `dev_db`
- **User**: `dev_user`
- **Pass**: `dev_password`

## Si algo falla: acciones directas (sin preguntas)

Notifica al usuario para que el pueda revisar mas a fondo aun si si puedes da un detalle mas claro pero no toque nada de los archivos, es decir solo da claridad al usuario de lo que paso y pordonde puede el revisar.

## Apagar servicios

### Sin borrar datos (mantiene volumen)

```bash
docker compose -f docker/docker-compose.yml down
```
