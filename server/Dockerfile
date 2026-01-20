FROM node:22-slim
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# --- FORCE COPY THE KEY FILE ---
COPY serviceAccountKey.json ./serviceAccountKey.json

# Copy everything else
COPY . .

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]