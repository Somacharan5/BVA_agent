# ---- Build stage ----
FROM node:20.14-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Use npm ci for reproducible builds
RUN npm ci

COPY . .

RUN npm run build


# ---- Production stage ----
FROM node:20.14-slim AS runner

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/.mastra ./.mastra

# Create data directory for persistent memory storage
RUN mkdir -p /app/data

# Set database path for production
ENV MASTRA_DB_PATH="file:/app/data/mastra.db"

EXPOSE 4111

CMD ["node", ".mastra/output/index.mjs"]
