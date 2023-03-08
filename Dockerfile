# syntax=docker/dockerfile:1.4

FROM node:lts AS development
# FROM node:16

WORKDIR /app

COPY . .

RUN yarn global add hexo-cli
RUN yarn install

CMD hexo s

FROM development as dev-envs
# 添加工具git docker vscode
# RUN <<EOF
# apt-get update
# apt-get install -y --no-install-recommends git
# EOF
# RUN <<EOF
# useradd -s /bin/bash -m vscode
# groupadd docker
# usermod -aG docker vscode
# EOF
# install Docker tools (cli, buildx, compose)
# COPY --from=gloursdocker/docker / /

CMD hexo s
# CMD serve public
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
