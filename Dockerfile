FROM node:14.17.6-alpine3.13 AS builder

WORKDIR /app

RUN apk add --no-cache git bash g++ make python3

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:1.20.0-alpine AS production

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/build/ ./

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx/default.conf /etc/nginx/conf.d/