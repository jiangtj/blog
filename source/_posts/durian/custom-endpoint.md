---
title: Spring Boot 自定义 Endpoint
categories: [后端]
tags: [Spring]
date: 2023-04-11 20:13:14
updated: 2023-04-11 20:13:14
---

# 介绍

下面是AI的介绍，如果你很了解可以直接跳到第二部分

在 Spring Boot 中，Endpoint 是一种可以暴露应用程序内部信息的机制。Endpoint 可以提供应用程序的健康状况、内存使用情况、线程信息、日志等等信息。通过访问这些 Endpoint，我们可以更加方便地了解应用程序的运行情况，进行问题排查和监控。

Spring Boot 提供了一些内置的 Endpoint，比如 /health、/metrics 等等，同时也支持自定义 Endpoint。我们可以通过在应用程序中添加 Spring Boot Actuator 依赖来启用这些内置的 Endpoint，也可以通过编写自定义 Endpoint 来扩展应用程序的监控能力。

一般来说，Endpoint 都是通过 HTTP 协议暴露出来的，可以通过浏览器、curl 命令等方式进行访问。同时，Spring Boot 还支持将 Endpoint 信息输出到控制台、JMX 等地方，方便我们查看。

在访问 Endpoint 时，我们需要提供正确的访问路径和身份验证信息（如果启用了身份验证）。Spring Boot 提供了许多安全措施来保护 Endpoint 的访问，比如只允许特定 IP 地址访问、启用 HTTPS 等等。

总之，Endpoint 是 Spring Boot 中非常重要的一个功能，可以帮助我们更加方便地监控和管理应用程序。如果您还没有使用过 Endpoint，建议您尝试一下，相信会有不错的体验。

<!-- more -->

# 开始自定义

简单说下为什么我要去自定义 Endpoint，这是我的一个开源项目 [J Cloud Platform](https://github.com/jiangtj/jc-platform) 需要的功能，我的计划是让每个微服务去管理自己的权限方案，那么会遇到一个问题，如果服务需要一个角色而我们的访问者不具备，那么网关不拦截，会在调用的服务上发生鉴权失败，这里http的请求数是2，我们都应该清楚，io是高耗时的操作，尤其是网络io。所以我们需要暴露每个微服务的权限信息，当然精度到角色够了，绝大多数的微服务都是简单的一个或两个角色与权限的映射，只有少量的需要自定义。详细可以去我看我代码的`micro-auth`部分，也期待你们的星星

## 创建 Role 对象

简单的创建一个 Role record，他包含自身的key也就是name，一个描述，和一系列的permissions

```java
public record Role(String name, String description, List<Permission> permissions) {
    @Override
    public String toString() {
        return name;
    }

    public static Role of(String name) {
        return of(name, "");
    }

    public static Role of(String name, String description) {
        return of(name, description, Collections.emptyList());
    }

    public static Role of(String name, String description, List<Permission> permissions) {
        return new Role(name, description, permissions);
    }
}

// e.g. Permission record
public record Permission(String name, String description) {
    //...
}
```

## 创建一个 Endpoint

```java
@Endpoint(id = "role") // (1)
public class RoleEndpoint {

    private final RoleContext context; // (2)
    private final static Role unknownRole = Role.of("UNKNOWN");

    public RoleEndpoint(RoleContext context) {
        this.context = context;
    }

    @ReadOperation // (3)
    public List<String> roles() {
        return context.getRoles().stream().map(Role::toString).toList();
    }

    @ReadOperation
    public Role info(@Selector String name) { // (4)
        Objects.requireNonNull(name);
        return context.getRoles().stream()
            .filter(role -> name.equals(role.name()))
            .findFirst()
            .orElse(unknownRole);
    }
}
```

可以看到 Endpoint 是很简单的，对上面的几点做个说明

1. `@Endpoint` 注解下bean，spring boot 都会放到actuator上，路径就是 `/actuator/{id}`，类似与在Class上的 `@RequestMapping`
2. `RoleContext` 是个函数式接口，实现是 `() -> roles`
3. `@ReadOperation` 就等于 `@GetMapping`，处理 GET 请求
4. 与 `@GetMapping` 不同的是，他对于参数的支持没有那么丰富，通过 `@Selector` 来获取 `/actuator/{id}` 后面的路径，比如我这个就是 `/actuator/{id}/{name}`，他的这个注解里，有个模式设置获取剩余的路径，比如如果在我那参数再多加一个 `@Selector(match = Match.ALL_REMAINING) String... paths`，会接受`/actuator/{id}/{name}/**` 

之所以参数支持不丰富，可能原因是为了支持jmx做的妥协，如果你只用某一技术类似的，Endpoint也提供了类似 `@RestController` 这样的注解，提供完整的 Wwb 能力。但我觉得没必要，需要 Endpoint 的场景都是框架，不该有复杂业务代码

另外，还有 `@EndpointExtension` 这样的注解，他的意思就是扩展这个端点，毕竟在 spring boot 里有servlet环境，也有reactor环境，不是所有的端点是一样的实现，然后却需要暴露到同一个id，这个会依据 `filter` 来确定什么时候使用，当然我不需要，就没试（不同 web 环境，在容器里注入了不同bean，哈哈）

## 怎么写数据

我这里只用到了读操作，写的话只能用官方的例子啦，在path上是一样的，除此之外，多了对query params和json格式的request body的获取，如果可选要添加 `@Nullable`

request body: 
```json
{
    "name": "test",
    "counter": 42
}
```

java code:
```java
@WriteOperation
public void updateData(String name, int counter) {
    // injects "test" and 42
}
```

## 注入容器

```java
    @Bean
    @ConditionalOnMissingBean
    public RoleEndpoint roleEndpoint(RoleContext context) {
        return new RoleEndpoint(context);
    }
```

最后，别忘了放进 spring 的容器中，毕竟只有这样才能被加载
