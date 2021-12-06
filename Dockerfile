FROM node:16

COPY . .

RUN yarn global add hexo-cli
RUN yarn install
CMD hexo s
