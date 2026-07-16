FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY server.ts ./

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
