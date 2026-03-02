# Full Stack Online Shop System

This is a complete full-stack application built with Go (no GORM, pure `pgx`), React (Vite, Tailwind), PostgreSQL, and Telegram Bot integration.

## Architecture

- **Backend**: Go 1.24, Gin Framework, standard `database/sql` with `pgx` driver.
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Database**: PostgreSQL 15, raw SQL migrations.
- **Bot**: Telegram Bot API (`go-telegram-bot-api`).

## Prerequisites

- Docker and Docker Compose
- Or: Go 1.24, Node.js 20, PostgreSQL 15 (if running natively)

## Setup with Docker (Recommended)

1. Clone the repository and navigate to the project root.
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your `TELEGRAM_BOT_TOKEN`.
4. Start the stack:
   ```bash
   make up
   # or
   docker-compose up -d
   ```
5. Seed the admin user:
   ```bash
   make seed
   # or
   docker-compose exec -T db psql -U postgres -d shop < scripts/seed_admin.sql
   ```

## Accessing the Apps

- **Frontend Admin Panel**: `http://localhost:5173`
  - Login Email: `admin@shop.com`
  - Login Password: `admin123`
- **Backend API**: `http://localhost:8080`
- **Telegram Bot**: Message your bot and send `/start` to see the storefront.

## Notes
- Ensure your bot token is correct, otherwise the backend will log a warning and run without the bot active.
- Image uploads are saved locally to the `backend/uploads` directory. In a real-world scenario, you would mount this volume or use S3.
