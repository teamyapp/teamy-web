FROM nginx:1.20.0-alpine

WORKDIR /usr/share/nginx/html

COPY build/ ./

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx/default.conf /etc/nginx/conf.d/
