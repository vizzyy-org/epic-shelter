FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN apk --no-cache add g++ groff less python make openssl tzdata py-pip && \
    npm install && \
    pip install awscli && \
    apk del make g++ py-pip

ENV TZ America/New_York

EXPOSE 8601
CMD [ "node", "app" ]