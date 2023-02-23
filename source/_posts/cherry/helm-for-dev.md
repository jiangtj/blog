---
title: 使用 Helm 管理开发环境
categories: [运维]
tags: []
date: 2023-02-23 11:25:11
updated: 2023-02-23 11:25:11
description: helm来管理开发环境会不会比docker更方便呢
---

# 添加负载均衡

在云端，这个通常是由云服务商提供的，但由于我们是本地。所以需要自己添加，traefik 是目前最主流的

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm install traefik traefik/traefik
```

运行下面命令，可以在 `http://127.0.0.1:9000/dashboard/` 查看仪表

```bash
kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000
```

# Nacos

Nacos 是 Spring Cloud 最好的服务发现与配置中心，我仍然使用了它的 `k8s operator`

首先安装 operator
```bash
git clone https://github.com/nacos-group/nacos-k8s.git
cd operator
helm install nacos-operator ./chart/nacos-operator 
```

其次安装 nacos
```bash
helm repo add jiangtj https://jiangtj.github.io/helm-charts
helm install nacos jiangtj/nacos-simple 
```

`nacos-simple` 包含了一个 `nacos.yaml` 定义nacos服务和一个 `ingress.yaml` 定义转发，[详见GitHub](https://github.com/jiangtj/helm-charts/tree/master/charts/nacos-simple)

# 总结

k8s 能定义一系列的服务，对于一个复杂开发环境来说，会比 docker 更加简单，比如同时需要redis rabbitmq mysql等等，尤其还能通过 helm 同步定义，当然简单的环境，还是 docker 吧
