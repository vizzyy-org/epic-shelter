FROM node:14-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV TZ America/New_York
EXPOSE 443
CMD [ "node", "app" ]
COPY . /usr/src/app
RUN npm install --silent --production
