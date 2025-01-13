# Development imajı
FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları yükle
COPY web/package*.json ./
RUN npm ci

# Kaynak kodları kopyala
COPY web/ .

# .next dizinini oluştur ve izinleri ayarla
RUN mkdir -p /app/.next && \
    chown -R node:node /app

# node kullanıcısına geç
USER node

# Geliştirme sunucusunu başlat
CMD ["npm", "run", "dev"] 