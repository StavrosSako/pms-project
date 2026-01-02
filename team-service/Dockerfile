# Use Node.js LTS version
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# The port will be injected from docker-compose
EXPOSE 8082

CMD [ "node", "index.js" ]