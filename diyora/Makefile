.PHONY: up down build logs seed

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

seed:
	docker-compose exec -T db psql -U postgres -d shop < scripts/seed_admin.sql
