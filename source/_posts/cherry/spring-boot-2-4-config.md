---
title: Spring Boot 2.4 新的配置文件处理方式
categories: []
tags: []
date: 2021-03-16 13:38:27
updated: 2021-03-16 13:38:27
---

配置文件是 Spring Boot 的一个核心特性，自正式版发布以来，几乎未改动过，而在2.4中，Spring 官方调整了配置文件的处理逻辑

- 外部配置文件优先于内部 Profile 配置
- 重命名 `spring.profiles` 为 `spring.config.activate.on-profile`
- 新增 Profile 组

<!-- more -->

# 配置文件优先级

在 2.4 中，最主要的修改是调整了配置文件优先级

之前，加载顺序为

1. ...(其他)
2. Jar 包外部的 Profile-specific 配置文件 (application-{profile}.properties)
3. Jar 包内部的 Profile-specific 配置文件 (application-{profile}.properties)
4. **Jar 包外部的主配置文件 (application.properties)**
5. Jar 包内部的主配置文件 (application.properties)
6. ...(其他)

在这个版本中

1. ...(其他)
2. Jar 包外部的 Profile-specific 配置文件 (application-{profile}.properties)
3. **Jar 包外部的主配置文件 (application.properties)**
4. Jar 包内部的 Profile-specific 配置文件 (application-{profile}.properties)
5. Jar 包内部的主配置文件 (application.properties)
6. ...(其他)

举个例子，假如有以下三个配置文件

Jar 包内部的 application.properties
```
secret=default-password
```

Jar 包内部的 application-dev.properties
```
secret=dev-password
```

Jar 包外部的 application.properties
```
secret=prod-password
```

之前版本 `secret` 为 `dev-password`，而在新版本中 `secret` 为 `prod-password`

同时用于顺序的调整，对 Profile-specific 配置文件做了一定的限制，禁止其使用 `spring.profiles.active` 和 `spring.profiles.include`，官方说的原因是，对于 `spring.config.activate.on-profile` 的判断只进行一次，所以不能嵌套使用，在实际使用中，避免这样的嵌套，可以更简洁明了

另外，如果你还是希望使用以前的处理逻辑，可以添加`spring.config.use-legacy-processing=true`

```yml
spring.config.use-legacy-processing=true

# any other properties
```

# 属性名调整

`spring.profiles` 修改为 `spring.config.activate.on-profile`，后者更加贴近用意，这个属性只在多文档的yaml文件中用到（用`---`分成多个配置）

例如在2.3或者更早，我们会进行以下配置

```yml
secret: "default-password"
---
spring:
  profiles: "dev"
secret: "dev-password"
---
spring:
  profiles: "prod"
secret: "production-password"
```

那么当我们升级到2.4，我们需要修改成以下样子

```yml
secret: "default-password"
---
spring:
  config:
    activate:
      on-profile: "dev"
secret: "dev-password"
---
spring:
  config:
    activate:
      on-profile: "prod"
secret: "production-password"
```

# Profile 组

前面我们已经提到，由于载入顺序的变化，Spring 增加了 Profile 不能使用 `spring.profiles.active` 和 `spring.profiles.include` 的限制，但有个常用的场景，就是可能需要同时使用两个 Profile 配置， 比如线上配置了 mysql 以及 rabbitmq

```yml
spring:
  config:
    activate:
      on-profile: "mysql"
  datasource:
    url: "jdbc:mysql://localhost/test"
    username: "dbuser"
    password: "dbpass"
---
spring:
  config:
    activate:
      on-profile: "rabbitmq"
  rabbitmq:
    host: "localhost"
    port: 5672
    username: "admin"
    password: "secret"
```

在之前，我们可以创建一个 prod 的 Profile 配置，去包含上面两个，方便启用

```yml
spring:
  config:
    activate:
      on-profile: "prod"
  profiles:
    include: "mysql,rabbitmq"
```

但新版中已经禁止了这样的写法，所以引入了“组”的概念，方便创建相应的便捷操作

```yml
spring:
  profiles:
    group:
      "prod": "mysql,rabbitmq"
```

*`spring.profiles.group` 同样不能用于 Profile 文件*

# 总结

尝试对自己的项目升了级，发现没有任何影响，在我的项目中，线上的配置文件习惯添加`spring.profiles.active=online`，用于阻止加载内部的 Profile 配置（现在也没创建 online 的 Profile 配置，就真只是为了阻止），这次的改动，大大点赞
