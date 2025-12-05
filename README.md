# 🎂 DessertBakery (Food Catalog) — повний CI/CD

![CI/CD Status](https://github.com/<YOUR-USER>/DessertBakery/actions/workflows/ci.yml/badge.svg)

Каталог десертів на Node.js + Express + MSSQL із повним CI/CD у GitHub Actions.

---
### CI
- Jest тести (API + сервіс)
- Звіт coverage
- Завантаження артефактів
- Лінт (якщо додати)
- Reusable workflow
- Job Summary із посиланням на артефакти
- Concurrent jobs + cancel-in-progress
- Мінімальні permissions

### CD
- Збірка Docker-образу
- Push у **GitHub Container Registry (GHCR)**
- Теги:
  - **vX.Y.Z**
  - **sha-<commit>**
- Додавання `docker save` артефакту (TAR)
- Автоматичний Release при пуші тега `v*`
- Trivy security scan (report-only)
- Dependabot для npm + GitHub Actions

---

# Локальний запуск

## 1. Клонування репозиторію
git clone https://github.com/<YOUR-USER>/DessertBakery.git
cd DessertBakery

## 2. Налаштування середовища
Створи файл .env, встав значення:

DB_USER=sa
DB_PASSWORD=YourStrong_Passw0rd1
DB_SERVER=food-catalog-db
DB_NAME=FoodCatalog
DB_PORT=1433
PORT=3000
USE_INMEMORY=false

## 3. Запуск у Docker
Зібрати образ:
docker build -t dessertbakery .

Запустити:
docker run -p 3000:3000 dessertbakery


Перевірка:

curl http://localhost:3000/health

## 4. Запуск через Docker Compose
docker compose up -d

Перегляд стану сервісів:
docker ps

Перезапуск:
docker compose down

GHCR (Container Registry)

# При пуші в main або при Release CI збирає та публікує образи:
ghcr.io/<YOUR-USER>/dessertbakery:v1.0.<run_number>
ghcr.io/<YOUR-USER>/dessertbakery:sha-<commit>

# Тести
Запустити тестування локально:

npm install

mysql -u root -p
CREATE DATABASE DessertBakery;

node server.js
# або
npm start
