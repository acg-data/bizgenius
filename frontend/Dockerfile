# BizGenius Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine as deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Stage 2: Builder
FROM node:20-alpine as builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 3: Production (nginx)
FROM nginx:alpine as production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S bizgenius && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G bizgenius bizgenius && \
    chown -R bizgenius:bizgenius /var/cache/nginx && \
    chown -R bizgenius:bizgenius /var/log/nginx && \
    chown -R bizgenius:bizgenius /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R bizgenius:bizgenius /var/run/nginx.pid

# Switch to non-root user
USER bizgenius

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
