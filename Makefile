.DEFAULT_GOAL := help
.PHONY: help setup install lint lint-fix format typecheck test build up down logs seed reset-db rebuild clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## First-time local setup (install deps, git hooks)
	npm install

install: ## Install dependencies
	npm install

lint: ## Lint all workspaces
	npm run lint

lint-fix: ## Lint and auto-fix
	npm run lint:fix

format: ## Format with Prettier
	npm run format

typecheck: ## Type-check all workspaces
	npm run typecheck

test: ## Run tests across workspaces
	npm run test

build: ## Build all workspaces
	npm run build

up: ## Start local stack (Docker Compose): SPA :8080, API :3000, mongo/redis/mailpit
	docker compose up -d --build

down: ## Stop local stack
	docker compose down

logs: ## Tail API logs
	docker compose logs -f api

seed: ## Seed local DB — available from Phase 3
	npm run seed --workspace backend

reset-db: ## Reset local DB (destructive, local only)
	npm run reset-db --workspace backend

rebuild: ## Rebuild images without cache
	docker compose build --no-cache

clean: ## Remove build artifacts and node_modules
	rm -rf node_modules **/node_modules **/dist **/coverage
