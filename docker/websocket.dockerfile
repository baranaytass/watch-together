FROM node:14

WORKDIR /app

COPY ./websocket/package.json ./websocket/package-lock.json ./
RUN npm install

COPY ./websocket/ ./

EXPOSE 8080

CMD ["npm", "start"] 