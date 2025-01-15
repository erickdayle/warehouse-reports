# Use Node.js base image
FROM node:20-alpine

# Create working directory in container
WORKDIR /app

# Set up environment variables
ENV NEXT_PUBLIC_ACE_API_URL=https://biotechnique.pscace.com/gateway/v2
ENV NODE_ENV=production

# Copy package files and configuration files first
COPY package*.json ./
COPY next.config.mjs ./
COPY tailwind.config.mjs ./
COPY postcss.config.mjs ./
COPY jsconfig.json ./
COPY .eslintrc.json ./

# Install dependencies
RUN npm install

# Copy source code and public assets
COPY src ./src
COPY public ./public

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]