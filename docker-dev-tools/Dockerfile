FROM node:20-alpine



COPY ../* /app/
COPY ./app/* /app

WORKDIR /app

ENTRYPOINT ["/app/entrypoint.sh"]