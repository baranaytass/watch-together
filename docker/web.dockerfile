# Development image
FROM node:18-alpine

WORKDIR /app

# Copy package files in a separate layer
COPY web/package*.json ./

# Install development dependencies
RUN npm ci

# Copy source code in a separate layer
COPY web/ .

# Set up non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/.next && chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm", "run", "dev"]
