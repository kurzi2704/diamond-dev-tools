FROM node:20-alpine


RUN mkdir /app

COPY ["package.json", "package-lock.json", "/app/"]
#COPY ["node_modules", "/app/"]
COPY ["*/*.json", "/app/"]
#packages/**/package.json ./

COPY docker-dev-tools/app/* /app

WORKDIR /app

RUN rm .git/ -rf

ENTRYPOINT ["/app/entrypoint.sh"]