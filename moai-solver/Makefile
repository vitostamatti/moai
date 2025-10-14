# Makefile for moai Python project
# Uses uv for package management, pytest for testing, and ruff for linting/formatting

.PHONY: help install install-dev test test-unit test-coverage lint format typecheck check clean build publish dev-setup ci pre-commit lint-notebooks format-notebooks lint-all format-all format-check-all pre-commit-install pre-commit-run pre-commit-update

# Default target
help:
	@echo "Available commands:"
	@echo "  install        Install production dependencies"
	@echo "  install-dev    Install development dependencies"
	@echo "  test           Run all tests"
	@echo "  test-unit      Run unit tests only"
	@echo "  test-coverage  Run tests with coverage report"
	@echo "  lint           Run linting checks (ruff check, excludes notebooks)"
	@echo "  lint-notebooks Run linting on notebooks only"
	@echo "  lint-all       Run linting on all files including notebooks"
	@echo "  format         Format code (ruff format, excludes notebooks)"
	@echo "  format-notebooks Format notebooks only"
	@echo "  format-all     Format all files including notebooks"
	@echo "  format-check   Check if code is properly formatted (excludes notebooks)"
	@echo "  format-check-all Check if all files are properly formatted"
	@echo "  typecheck      Run type checking (mypy)"
	@echo "  check          Run all checks (lint + format-check + typecheck)"
	@echo "  clean          Clean build artifacts and cache"
	@echo "  build          Build the package"
	@echo "  publish        Publish to PyPI"
	@echo "  dev-setup      Set up development environment"
	@echo "  ci             Run full CI pipeline"
	@echo "  pre-commit     Run pre-commit checks"
	@echo "  pre-commit-install Install pre-commit hooks"
	@echo "  pre-commit-run Run pre-commit on all files"
	@echo "  pre-commit-update Update pre-commit hooks"

# Installation
install:
	uv sync --no-dev

install-dev:
	uv sync

# Testing
test:
	uv run pytest

test-unit:
	uv run pytest tests/unit/

test-coverage:
	uv run pytest --cov=src/moai --cov-report=html --cov-report=term-missing --cov-report=xml

# Linting and formatting
lint:
	uv run ruff check . --exclude notebooks/

lint-fix:
	uv run ruff check --fix . --exclude notebooks/

lint-notebooks:
	uv run ruff check notebooks/

lint-all:
	uv run ruff check .

format:
	uv run ruff format . --exclude notebooks/

format-notebooks:
	uv run ruff format notebooks/

format-all:
	uv run ruff format .

format-check:
	uv run ruff format --check . --exclude notebooks/

format-check-all:
	uv run ruff format --check .

# Type checking (add mypy to dev dependencies if you want to use it)
typecheck:
	@echo "Installing mypy for type checking..."
	uv add --dev mypy
	uv run mypy src/moai

# Combined checks
check: lint format-check
	@echo "All checks passed!"

# Cleaning
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .pytest_cache/
	rm -rf .ruff_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .mypy_cache/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

# Building and publishing
build: clean
	uv build

publish: build
	uv publish

# Development setup
dev-setup: install-dev pre-commit-install
	@echo "Development environment setup complete!"
	@echo "Run 'make help' to see available commands."

# CI pipeline
ci: install-dev lint format-check test-coverage
	@echo "CI pipeline completed successfully!"

# Pre-commit checks (run before committing)
pre-commit: format lint test
	@echo "Pre-commit checks completed!"

# Pre-commit setup and management
pre-commit-install:
	uv add --dev pre-commit
	uv run pre-commit install

pre-commit-run:
	uv run pre-commit run --all-files

pre-commit-update:
	uv run pre-commit autoupdate

# Quick development commands
dev-test:
	uv run pytest -x -v

dev-test-watch:
	uv run pytest-watch

# Add dependencies
add-dep:
	@read -p "Enter package name: " pkg; \
	uv add $$pkg

add-dev-dep:
	@read -p "Enter dev package name: " pkg; \
	uv add --dev $$pkg

# Security audit
audit:
	uv run pip-audit

# Update dependencies
update:
	uv sync --upgrade

# Lock dependencies
lock:
	uv lock

# Remove virtual environment and reinstall
reset:
	rm -rf .venv
	uv sync

# Run specific test file
test-file:
	@read -p "Enter test file path: " file; \
	uv run pytest $$file -v

# Generate requirements.txt for compatibility
requirements:
	uv export --no-dev > requirements.txt
	uv export > requirements-dev.txt
	@echo "Generated requirements.txt and requirements-dev.txt"
