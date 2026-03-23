# Diyora Online Shop & Cafe System 🛒☕

A complete, full-stack e-commerce and cafe management application built with Go, React (Vite & Tailwind CSS), PostgreSQL, and seamless Telegram Bot integration.

## 🌟 Key Features

- **Storefront & Admin Panel**: A beautiful, fully responsive React frontend to manage products, categories, users, and track orders.
- **Telegram Bot Integration**: A dedicated Telegram Bot for customers to browse categories, view products, add to cart, and checkout seamlessly matching the frontend data. 
- **Internationalization (i18n)**: Multi-language support out of the box (English, Russian, Uzbek) across both the Web Interface and the Telegram Bot.
- **Premium UI/UX**: Built with Tailwind CSS and Lucide Icons, featuring glassmorphism, responsive data grids, and smooth micro-animations.
- **Robust Backend**: Written in Go 1.24 using the Gin framework, securely communicating with PostgreSQL via native `pgx` driver (no ORM overhead).

## 🏗️ Architecture

- **Backend**: Go 1.24, Gin Framework, standard `database/sql` with `pgx` driver.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, i18next.
- **Database**: PostgreSQL 15, raw SQL migrations.
- **Bot**: Telegram Bot API (`go-telegram-bot-api`).

## 🚀 Prerequisites

- Docker and Docker Compose (Recommended)
- **OR** Native installation: Go 1.24, Node.js 20, PostgreSQL 15

## 🛠️ Setup With Docker (Recommended)

1. **Clone the repository** and navigate to the project root.
2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your **`TELEGRAM_BOT_TOKEN`** (get one from [@BotFather](https://t.me/BotFather)).
4. **Start the stack**:
   ```bash
   make up
   # or
   docker-compose up -d
   ```
5. **Seed the admin user** (to access the dashboard):
   ```bash
   make seed
   # or
   docker-compose exec -T db psql -U postgres -d shop < scripts/seed_admin.sql
   ```

## 📱 Accessing the Apps

- **Frontend Admin Panel**: `http://localhost:5173`
  - Login Email: `admin@shop.com`
  - Login Password: `admin123`
- **Backend API**: `http://localhost:8080`
- **Telegram Bot**: Message your bot and send `/start` to see the storefront.

## 🌐 Localization

The platform currently supports 3 languages:
- 🇺🇸 English (`en`)
- 🇺🇿 Uzbek (`uz`)
- 🇷🇺 Russian (`ru`)

Translations can be extended via the `frontend/src/locales/` directory for the web panel and directly inside `backend/internal/telegram/bot.go` for the bot.

## 📂 Project Structure

```text
├── backend/               # Go API server & Telegram Bot
│   ├── cmd/               # Entry points
│   ├── internal/          # Handlers, models, repos, and telegram logic
│   └── migrations/        # SQL migration files
├── frontend/              # React Admin Panel
│   ├── src/
│   │   ├── api/           # Axios interceptors & config
│   │   ├── components/    # Reusable UI components
│   │   ├── layouts/       # Dashboard & Auth layouts
│   │   ├── locales/       # i18n JSON files
│   │   └── pages/         # Dashboard, Products, Orders, Users, etc.
├── docker-compose.yml     # Container orchestration
└── Makefile               # Helper commands
```

## 📝 Notes

- Ensure your bot token is correct in the `.env` file, otherwise the backend will log a warning and run without the bot active.
- Image uploads are saved locally to the `backend/uploads` directory. In a real-world scenario, you would mount this volume or use a cloud provider like AWS S3.
