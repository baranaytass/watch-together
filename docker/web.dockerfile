# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala ve bağımlılıkları yükle
COPY web/package*.json ./
RUN npm ci

# Kaynak kodları kopyala ve derle
COPY web/ .
RUN npm run build

# Production imajı
FROM node:18-alpine

WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Güvenlik için non-root kullanıcı
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
