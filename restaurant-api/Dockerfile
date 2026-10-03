FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY server.js .

EXPOSE 4000

CMD ["npm", "start"]
