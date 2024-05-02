FROM node:20.11.1-alpine3.19 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && ls

FROM node:20.11.1-alpine3.19 as server

WORKDIR /app

COPY --from=builder /app/dist /app
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3055

CMD node index.js