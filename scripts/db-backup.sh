#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${1:-${PROJECT_ROOT}/backups}"

if command -v docker.exe >/dev/null 2>&1; then
  DOCKER_BIN="docker.exe"
elif command -v docker >/dev/null 2>&1; then
  DOCKER_BIN="docker"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_BIN="docker-compose"
else
  echo "Docker n'est pas disponible dans le PATH."
  exit 1
fi

run_compose() {
  if [ "${DOCKER_BIN}" = "docker" ] || [ "${DOCKER_BIN}" = "docker.exe" ]; then
    "${DOCKER_BIN}" compose "$@"
  else
    "${DOCKER_BIN}" "$@"
  fi
}

mkdir -p "${BACKUP_DIR}"

if [ "${DOCKER_BIN}" = "docker.exe" ] && command -v wslpath >/dev/null 2>&1; then
  PROJECT_ROOT_WIN="$(wslpath -w "${PROJECT_ROOT}")"
  cd "${PROJECT_ROOT_WIN}"
fi

if [ -f "${PROJECT_ROOT}/.env" ]; then
  set -a
  . "${PROJECT_ROOT}/.env"
  set +a
fi

DB_NAME="${MYSQL_DATABASE:-forum_assurance}"
DB_USER="${MYSQL_USER:-forum}"
DB_PASSWORD="${MYSQL_PASSWORD:-forum_password}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
OUTPUT_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

if ! run_compose ps db >/dev/null 2>&1; then
  echo "Le conteneur MySQL n'est pas démarré."
  echo "Lancez : docker compose up -d"
  exit 1
fi

if ! run_compose exec -T db sh -c "mysqladmin ping -h 127.0.0.1 -u\"${DB_USER}\" -p\"${DB_PASSWORD}\" --silent" >/dev/null 2>&1; then
  echo "La base de données n'est pas accessible depuis le conteneur DB."
  exit 1
fi

run_compose exec -T db sh -c "exec mysqldump -u\"${DB_USER}\" -p\"${DB_PASSWORD}\" --databases \"${DB_NAME}\" --single-transaction --routines --events --triggers" > "${OUTPUT_FILE}"

gzip -f "${OUTPUT_FILE}"

echo "Sauvegarde créée : ${OUTPUT_FILE}.gz"
