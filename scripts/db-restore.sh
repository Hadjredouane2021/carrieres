#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage : $0 <fichier-backup.sql|fichier-backup.sql.gz>"
  exit 1
fi

FILE_PATH="$1"
if [ ! -f "${FILE_PATH}" ]; then
  echo "Fichier introuvable : ${FILE_PATH}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

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
TMP_SQL="$(mktemp)"

cleanup() {
  rm -f "${TMP_SQL}"
}
trap cleanup EXIT

if [[ "${FILE_PATH}" == *.gz ]]; then
  gzip -dc "${FILE_PATH}" > "${TMP_SQL}"
else
  cp "${FILE_PATH}" "${TMP_SQL}"
fi

echo "Restauration de ${FILE_PATH} vers ${DB_NAME}..."
run_compose exec -T db sh -c "exec mysql -u\"${DB_USER}\" -p\"${DB_PASSWORD}\" \"${DB_NAME}\"" < "${TMP_SQL}"

echo "Restauration terminée."
