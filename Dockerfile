# Use Node.js base image
FROM node:20-alpine

# Create working directory in container
WORKDIR /app

# Set up environment variables
ENV NEXT_PUBLIC_ACE_API_URL=https://biotechnique.pscace.com/gateway/v2

# Copy package files and configuration files first
COPY package*.json ./
COPY *.config.* ./
COPY jsconfig.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install --include=dev

# Copy source code and public assets
COPY src ./src
COPY public ./public

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application with production environment
ENV NODE_ENV=production
CMD ["npm", "start"]