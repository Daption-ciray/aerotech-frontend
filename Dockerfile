# AeroTech Frontend – Railway / Docker (build + static serve)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Build sırasında backend URL (Railway Variables'tan gelir; boşsa build yine çalışır)
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

RUN npm run build:docker

# Production: static dosyaları serve et
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
