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
RUN npm install -g pm2

# Set the command to start the application using pm2 and the ecosystem.config.cjs file
CMD ["pm2-runtime", "start", "./ecosystem.config.cjs"]
