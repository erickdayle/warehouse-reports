# Use Node.js base image
FROM node:20-alpine

# Create working directory in container
WORKDIR /app

# Set up environment variables
ENV NEXT_PUBLIC_ACE_API_URL=https://biotechnique.pscace.com/gateway/v2
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY next.config.mjs ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]