FROM node:14-alpine
WORKDIR /usr/src/app
ENV TZ America/New_York
COPY qemu-arm-static /usr/bin
COPY package*.json ./
RUN npm install --silent --production
COPY . /usr/src/app
CMD [ "node", "app" ]