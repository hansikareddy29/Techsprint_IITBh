# Use Node image
FROM node:22-slim
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the app in development mode
CMD ["npm", "run", "dev", "--", "--host"]