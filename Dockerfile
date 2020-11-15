FROM arm64v8/node:14-alpine
WORKDIR /usr/src/app
ENV TZ America/New_York
COPY package*.json ./
RUN npm install --silent --production
COPY . /usr/src/app
CMD [ "node", "app" ]