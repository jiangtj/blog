# syntax=docker/dockerfile:1.4

FROM node:lts AS buildhexo
RUN npm install -g pnpm hexo-cli

FROM buildhexo AS development
WORKDIR /app
COPY . .
RUN pnpm install
CMD hexo s

FROM buildhexo as dev-envs
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
CMD /bin/sh -c "while sleep 1000; do :; done"
