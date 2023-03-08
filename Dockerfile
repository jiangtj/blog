FROM node:16

# RUN ls /com.docker.devenvironments.code
# RUN ls /code

COPY . .

RUN yarn global add hexo-cli
RUN yarn install
ENV HOST=localhost
CMD hexo s
# CMD serve public
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
