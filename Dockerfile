# Use Node.js Alpine as base
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

# Install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json pnpm-lock.yaml /temp/dev/
RUN cd /temp/dev && pnpm install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile --prod

# Copy node_modules from temp directory and project files
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Setup production image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/pnpm-lock.yaml .

# Set production environment and DNS options
ENV NODE_ENV=production
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port
EXPOSE ${PORT}

# Add healthcheck
HEALTHCHECK CMD curl --fail http://0.0.0.0:${PORT} || exit 1

# Run the app using tsx
CMD ["npx", "tsx", "./src/app.ts"]
