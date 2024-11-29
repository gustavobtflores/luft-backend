FROM node:alpine

WORKDIR /usr/src/app  

RUN yarn --offline --frozen-lockfile --link-duplicates

COPY . .

EXPOSE 9000  

CMD yarn start
