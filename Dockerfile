FROM node:16

WORKDIR /com.docker.devenvironments.code

RUN yarn global add hexo-cli
RUN yarn install
CMD yarn server
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
