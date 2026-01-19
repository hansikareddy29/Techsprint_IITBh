# Use a stable Node.js version
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Cloud Run and most Docker environments use port 8080
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]