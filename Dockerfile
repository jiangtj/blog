FROM node:16

WORKDIR /com.docker.devenvironments.code

RUN ls -a

WORKDIR /code

RUN ls -a
RUN yarn global add hexo-cli
CMD yarn server
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
