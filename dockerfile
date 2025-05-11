# Use the official Bun image as base
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files for backend
COPY package.json bun.lockb* ./

# Install backend dependencies
RUN bun install --frozen-lockfile

# Copy admin dashboard package files
COPY admin-dashboard/package.json admin-dashboard/bun.lockb* ./admin-dashboard/

# Install admin dashboard dependencies
WORKDIR /app/admin-dashboard
RUN bun install --frozen-lockfile

# Build the admin dashboard (React project)
COPY admin-dashboard/ ./
RUN bun run build

# Return to main directory and copy all backend files
WORKDIR /app
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create volume for persistent data
VOLUME ["/app/data"]

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "server"]