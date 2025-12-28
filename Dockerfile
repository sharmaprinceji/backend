FROM node:20-alpine

WORKDIR /app

# Copy only dependency files first (cache friendly)
COPY package*.json ./

# Install dependencies (prod + needed runtime deps)
RUN npm install

# Copy source code
COPY . .

# Environment
ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "run", "start"]
