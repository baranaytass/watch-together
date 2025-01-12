# Multi-stage build kullanarak imaj boyutunu küçültelim
FROM node:18-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala ve bağımlılıkları yükle
COPY backend/package*.json ./
RUN npm ci

# Kaynak kodları kopyala ve derle
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Production imajı
FROM node:18-alpine

WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Güvenlik için non-root kullanıcı
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Environment değişkenleri
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["node", "dist/app.js"]
