FROM node:16-alpine

RUN mkdir /project
WORKDIR /project
COPY package.json yarn.lock ./

RUN yarn global add hexo-cli
RUN yarn install
CMD hexo s
