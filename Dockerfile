# Base image
FROM node:8.2.0-alpine

# It's me ...
MAINTAINER WoLfulus <wolfulus@gmail.com>

# Dependencies
#RUN apk update && \
#    apk upgrade && \
#    apk add --no-cache bash gawk sed grep bc coreutils git openssh

# Creates the app directory
RUN mkdir -p /app
WORKDIR /app

# Copy package definition and install dependencies
COPY package.json package-lock.json /app/
RUN npm install && npm cache clean --force

# Copy projects files
COPY . /app

# Environment variables
ARG NODE_ENV=development
ENV NODE_ENV ${NODE_ENV:-development}

ARG API_VERSION=default
ENV API_VERSION ${API_VERSION:-default}

ARG API_COMMIT=default
ENV API_COMMIT ${API_COMMIT:-default}

# Scripts
RUN chmod +x /app/scripts/build.sh && \
    chmod +x /app/scripts/run.sh && \
    /app/scripts/build.sh

# Comando default executado no `docker run <image>`
CMD ["node", "index"]
