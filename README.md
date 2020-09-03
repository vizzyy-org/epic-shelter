# ![Grafana Screenshot](public/favicon.ico) Epic-Shelter 


![Node.js CI](https://github.com/Vizzyy/epic-shelter/workflows/Node.js%20CI/badge.svg?branch=master)

![Docker CI](https://github.com/vizzyy-org/epic-shelter/workflows/Docker%20CI/badge.svg?branch=master) 

```dockerfile
FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN apk add g++ python make tzdata
RUN npm install --silent
RUN apk del make python g++

ENV TZ America/New_York

EXPOSE 443
CMD [ "node", "app" ]
```
