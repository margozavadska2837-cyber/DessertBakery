# Базовий образ Node.js
FROM node:20-alpine

# Робоча директорія всередині контейнера
WORKDIR /app

# Копіюємо package.json та встановлюємо залежності
COPY package*.json ./
RUN npm ci --omit=dev

# Копіюємо решту файлів
COPY . .

# Виставляємо порт
EXPOSE 3000

# Запуск застосунку
CMD ["node", "server.js"]