# ![Grafana Screenshot](public/favicon.ico) Epic-Shelter 


![Node.js CI](https://github.com/Vizzyy/epic-shelter/workflows/Node.js%20CI/badge.svg?branch=master)
![Docker CI](https://github.com/vizzyy-org/epic-shelter/workflows/Docker%20CI/badge.svg?branch=master) 
![CodeQL](https://github.com/vizzyy-org/epic-shelter/workflows/CodeQL/badge.svg?branch=master) 

```dockerfile
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --silent --production
COPY . /usr/src/app
CMD [ "node", "app" ]
```
