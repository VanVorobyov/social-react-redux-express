# Используем образ дистрибутив линукс Alpine с версией Node.js 19.5.0
FROM node:19.5.0-alpine

# Указываем нашу рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json внутрь контейнера
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Копируем Prisma schema внутрь контейнера
COPY prisma/schema.prisma ./prisma/

# Устанавливаем Prisma
RUN npm install -g prisma

# Генерируем Prisma client
RUN prisma generate

# Открываем порт в нашем контейнере
EXPOSE 3005

# Запускаем сервер
CMD [ "npm", "start" ]
