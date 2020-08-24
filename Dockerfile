FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN apk add g++ python make tzdata
RUN npm install
RUN apk del make python g++

ENV TZ America/New_York

EXPOSE 443
CMD [ "node", "app" ]