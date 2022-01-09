FROM node:17

WORKDIR /app
COPY package*.json ./
COPY ../ ./
RUN npm install
EXPOSE 8000

ENTRYPOINT [ "node", "index.js"]