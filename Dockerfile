FROM node:20-alpine

WORKDIR /usr/src/app

# Enable pnpm 10.x
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Health check
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["pnpm", "start"]
