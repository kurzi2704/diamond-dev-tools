#syntax=docker/dockerfile:1.7-labs
FROM node:20-alpine


RUN mkdir /app

COPY ["package.json", "package-lock.json", "/app/"]
#COPY ["node_modules", "/app/"]
COPY --parents */*.json /app/
COPY node_modules /app/
COPY node_modules/.bin /app/node_modules/.bin
 
COPY --parents */*.ts /app/
#packages/**/package.json ./

COPY docker-dev-tools/app/* /app

WORKDIR /app

RUN rm .git/ -rf

ENTRYPOINT ["/app/entrypoint.sh"]