FROM node:16

# RUN ls /com.docker.devenvironments.code
# RUN ls /code
RUN yarn global add hexo-cli serve
CMD serve .
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
