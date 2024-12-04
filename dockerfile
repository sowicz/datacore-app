# Stage 1: Build the application
FROM node:20-alpine AS builder


# Set working directory
WORKDIR /app


# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma Client and build the Remix app
RUN npx prisma generate
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy built files and production dependencies from the builder stage
COPY --from=builder /app /app

# Copy the .env file
# COPY .env ./

# Install production-only dependencies
RUN npm install --production

# Expose port 3000
EXPOSE 3000

# Seed the database (run the seed script)
RUN npm run prisma:seed

# Start the Remix app
CMD ["npm", "run", "start"]
