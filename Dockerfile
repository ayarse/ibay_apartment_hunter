# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy everything from the current directory to the working directory
COPY . .

# Install pnpm globally
RUN npm install -g pnpm

# Install application dependencies
RUN pnpm install

# Install pm2 globally
# RUN npm install -g pm2

EXPOSE ${PORT}

ENV NODE_OPTIONS="--dns-result-order=ipv4first"

HEALTHCHECK CMD curl --fail http://0.0.0.0:${PORT} || exit 1

# Start App
CMD ["node", "--import", "tsx", "src/app.ts"]
