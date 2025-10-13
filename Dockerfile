# Dockerfile — Skunkworks API
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
