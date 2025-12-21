FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@10 --activate

# Create non-root user early
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Fix ownership and switch to non-root user
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Start the app with tsx
CMD ["pnpm", "start"]
