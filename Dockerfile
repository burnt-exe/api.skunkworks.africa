# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app files
COPY . .

# ---- Runtime Stage ----
FROM node:20-alpine
WORKDIR /app

# Copy built app
COPY --from=build /app .

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port for Cloud Run
EXPOSE 8080

# Start app
CMD ["npm", "start"]
