FROM node:10-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3600

CMD ["node", "./build/app.js"]