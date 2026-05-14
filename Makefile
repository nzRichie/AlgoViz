.PHONY: dev build up down test

dev:
	npm run dev

build:
	npm run build

up:
	docker compose up --build

down:
	docker compose down

test:
	npm test
	pytest packages/tracer/tests
