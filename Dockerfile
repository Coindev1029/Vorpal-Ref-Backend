FROM node:20.11.1-alpine3.19 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && ls

FROM node:20.11.1-alpine3.19 as server

COPY --from=builder /app/dist /app

CMD node index.js