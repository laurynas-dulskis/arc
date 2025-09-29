FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose the development port
EXPOSE 5173

# Start the development server with hot reload
CMD ["npm", "run", "start"]