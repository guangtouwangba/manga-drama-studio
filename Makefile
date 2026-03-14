.PHONY: dev frontend backend install clean

# Start both frontend and backend concurrently
dev:
	@echo "Starting manga-drama-studio..."
	@make -j2 frontend backend

frontend:
	cd packages/frontend && npm run dev

backend:
	cd packages/backend && uv run uvicorn manga_drama.main:app --reload --port 8000

# Install all dependencies
install:
	cd packages/frontend && npm install
	cd packages/backend && uv sync

# Build frontend for production
build:
	cd packages/frontend && npm run build

# Run tests
test:
	cd packages/frontend && npm run test
	cd packages/backend && uv run pytest

clean:
	rm -rf packages/frontend/dist
	rm -rf packages/backend/.venv
