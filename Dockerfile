FROM node:16

COPY . .

RUN yarn global add hexo-cli
RUN yarn install
RUN git config --global --unset http.proxy
RUN git config --global --unset https.proxy
