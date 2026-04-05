FROM ghcr.io/puppeteer/puppeteer:24.7.2
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
