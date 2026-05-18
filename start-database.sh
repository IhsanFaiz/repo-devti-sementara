#!/usr/bin/env bash

# ==============================================================================
# OPTIMIZED DATABASE STARTER SCRIPT
# ==============================================================================
# Features:
# - Auto-detect Docker/Podman
# - Windows/WSL Line Ending Fix (CRLF support)
# - Data Persistence (Docker Volumes)
# - Auto Seeding prompt
# - Auto-Sync Password (Fixes P1000 Auth Errors)
# ==============================================================================

# 1. Load Environment Variables
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create one."
  exit 1
fi

set -a
source .env
set +a

# 2. Windows/WSL Compatibility Fix
# Membersihkan variabel dari karakter '\r' yang tidak terlihat tapi mematikan
DATABASE_URL=$(echo "$DATABASE_URL" | tr -d '\r')

# 3. Parse Connection Details Robustly
# Format: postgres://user:password@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*@.*/\([^?]*\).*|\1|p')

# Fallback values if parsing fails
DB_USER=${DB_USER:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-postgres}

DB_CONTAINER_NAME="$DB_NAME-postgres"
DB_VOLUME_NAME="$DB_NAME-data"

echo "⚙️  Config: DB=$DB_NAME | Port=$DB_PORT | Container=$DB_CONTAINER_NAME"

# 4. Detect Container Engine
if command -v docker >/dev/null 2>&1; then
  CONTAINER_CMD="docker"
elif command -v podman >/dev/null 2>&1; then
  CONTAINER_CMD="podman"
else
  echo "❌ Error: Docker or Podman is not installed."
  exit 1
fi

# 5. Check Engine Status
if ! $CONTAINER_CMD info > /dev/null 2>&1; then
  echo "❌ Error: $CONTAINER_CMD daemon is not running."
  exit 1
fi

# --- FUNCTION: Sync Credentials & Wait ---
sync_db_credentials() {
  echo "⏳ Waiting for database to be ready..."
  # Loop until pg_isready returns 0
  until $CONTAINER_CMD exec "$DB_CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; do
      sleep 1
  done

  # FIX P1000 ERROR: Force update the password to match .env
  # This ensures that even if .env changed, the container is updated.
  echo "🔄 Syncing database credentials with .env..."
  $CONTAINER_CMD exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "ALTER USER \"$DB_USER\" WITH PASSWORD '$DB_PASSWORD';" > /dev/null 2>&1
  
  echo "✅ Database is ready and synced."
}

# --- FUNCTION: Post Start Actions (Push & Seed) ---
post_start_action() {
  echo ""
  # Note: Database wait/sync is now handled before calling this function.

  # Cek apakah ada script seed di package.json sebelum tanya user
  if ! grep -q "db:seed" package.json; then
     return
  fi

  read -p "🌱 Do you want to run 'db:push' and 'db:seed'? [y/N]: " -r REPLY
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "bun.lockb" ]; then CMD="bun run"
    elif [ -f "pnpm-lock.yaml" ]; then CMD="pnpm run"
    elif [ -f "yarn.lock" ]; then CMD="yarn"
    else CMD="npm run"
    fi

    echo "🚀 Running schema push..."
    $CMD db:push
    
    echo "🌱 Running seeder..."
    $CMD db:seed
    
    echo "✅ Done!"
  fi
}

# 6. Check Container Status
if [ "$($CONTAINER_CMD ps -q -f name="$DB_CONTAINER_NAME")" ]; then
  echo "✅ Database container '$DB_CONTAINER_NAME' is already running."
  sync_db_credentials
  post_start_action
  exit 0
fi

if [ "$($CONTAINER_CMD ps -q -a -f name="$DB_CONTAINER_NAME")" ]; then
  $CONTAINER_CMD start "$DB_CONTAINER_NAME"
  echo "✅ Existing container '$DB_CONTAINER_NAME' started."
  sync_db_credentials
  post_start_action
  exit 0
fi

# 7. Check Port Conflict
if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "❌ Error: Port $DB_PORT is already in use by another application."
    exit 1
  fi
fi

# 8. Password Generator (If default)
if [ "$DB_PASSWORD" = "password" ]; then
  echo "⚠️  You are using the default password 'password'."
  read -p "   Generate a random secure password? [y/N]: " -r REPLY
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    # Cross-platform sed for .env update
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|:password@|:$DB_PASSWORD@|" .env
    else
      sed -i "s|:password@|:$DB_PASSWORD@|" .env
    fi
    echo "🔒 Password updated in .env"
  fi
fi

# 9. RUN CONTAINER (With Volume Persistence)
$CONTAINER_CMD run -d \
  --name "$DB_CONTAINER_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "$DB_PORT":5432 \
  -v "$DB_VOLUME_NAME":/var/lib/postgresql/data \
  postgres:15-alpine \
  && echo "✅ Database container '$DB_CONTAINER_NAME' created successfully."

# Ensure new container is ready and synced (just in case)
sync_db_credentials
post_start_action