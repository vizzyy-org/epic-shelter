FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --silent --production
COPY . /usr/src/app
CMD [ "node", "app" ]