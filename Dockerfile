FROM node:16

# RUN ls /com.docker.devenvironments.code
# RUN ls /code

COPY . .

RUN yarn global add hexo-cli
RUN yarn install

# 添加工具git docker vscode
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF
RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /

CMD hexo s
# CMD serve public
# RUN git config --global --unset http.proxy
# RUN git config --global --unset https.proxy
