FROM node:20-alpine AS build

WORKDIR /srv/algoviz
COPY package.json package-lock.json ./
COPY packages ./packages
COPY tsconfig.base.json ./
RUN npm ci
RUN npm run build --workspace @algoviz/app

FROM nginx:alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /srv/algoviz/packages/app/dist /usr/share/nginx/html
