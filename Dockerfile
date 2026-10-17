FROM node:24.20.0-alpine

WORKDIR /app

COPY package.json package-lock.json .nvmrc .env.example Makefile README.md ./
COPY assets ./assets
COPY mockups ./mockups
COPY site ./site

RUN apk add --no-cache make && npm run render && npm test

EXPOSE 4173
CMD ["npm", "run", "serve"]
