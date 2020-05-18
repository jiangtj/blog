---
title: Spring Cloud 之 Gateway （Greenwich版）
categories: [后端]
tags: [微服务,Spring Cloud]
date: 2019-05-20 21:16:33
updated: 2019-05-20 21:16:33
---

众所周知，netflix OSS 2.0 难产了，上一代的zuul网关虽说不错，但其并不是异步的。所以，Spring团队推出了基于Spring Webflux的全新异步的网关--Spring Cloud Gateway。

> 本文内容基于Spring Cloud Gateway 2.1.0.GA

来跟着我一步步，探索它的~~魅力~~坑吧！

<!-- more -->

# 环境搭建

与所有的微服务组件一样，demo总是很简单的，如果你要启用，创建时勾上相关依赖即可。

就像这样：
```xml
<dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
```
其中`lombok`是我的习惯，你可以选择不添加。

启动类修改为`@SpringCloudApplication`。
```java
@SpringCloudApplication
public class SpringCloudGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringCloudGatewayApplication.class, args);
    }
}
```

添加些简单配置（一个路由），跳转到我的博客，直接填写了url。由于只涉及网关，所以我把不必要的eureka关了，但实际开发中需要使用它，并添加ribbon路由`lb://<service-name>`
```yml
spring:
  cloud:
    gateway:
      routes:
        - id: app
          uri: http://www.dnocm.com
          # lb: Ribbon
          # uri: lb://app-name
          predicates:
            - Path=/app/**
          filters:
            # Strip first path，such base
            - StripPrefix=1
            # - RewritePath=/base/,/
eureka:
  client:
    enabled: false
```

就此完成，启动运行。当你访问`localhost:8080/app/**`路由时，都会调整至`www.dnocm.com/**`。这是因为我设置了`http`一律`302`跳转至`https`。所以，这证明我们的网关搭建完成啦！！

# Route Predicate Factory
id uri顾名思义，不多说，但predicates是什么呢？predicates做动词有`使基于; 使以…为依据; 表明; 阐明; 断言;`的意思，简单说，用于表明在那种条件下，该路由配置生效。

官方提供给我了许多的predicates
```yml
spring:
  cloud:
    gateway:
      routes:
      - id: example
        uri: http://example.org
        predicates:
        # 匹配在什么时间之后的
        - After=2017-01-20T17:42:47.789-07:00[America/Denver]
        # 匹配在什么时间之前的
        - Before=2017-01-20T17:42:47.789-07:00[America/Denver]
        # 匹配在某段时间的
        - Between=2017-01-20T17:42:47.789-07:00[America/Denver], 2017-01-21T17:42:47.789-07:00[America/Denver]
        # 匹配cookie名称为`chocolate`的值要符合`ch.p`正则.
        - Cookie=chocolate, ch.p
        # 匹配header为`X-Request-Id`的值要符合`\d+`正则.
        - Header=X-Request-Id, \d+
        # 匹配任意符合`**.somehost.org`与`**.anotherhost.org`正则的网址
        - Host=**.somehost.org,**.anotherhost.org
        # Host还支持模版变量，会保存在`ServerWebExchange.getAttributes()`的 ServerWebExchangeUtils.URI_TEMPLATE_VARIABLES_ATTRIBUTE中，以Map形式存储
        - Host={sub}.myhost.org
        # 匹配GET方法
        - Method=GET
        # 路径匹配，与Host一样支持模版变量，存在URI_TEMPLATE_VARIABLES_ATTRIBUTE中。
        - Path=/foo/{segment},/bar/{segment}
        # 匹配存在baz查询参数
        - Query=baz
        # 匹配存在foo且符合`ba.`正则
        - Query=foo, ba.
        # 匹配远程地址
        - RemoteAddr=192.168.1.1/24
```

官方几乎提供了我们所需的全部功能，这点值得鼓掌👏，然而假如遇到无法满足的情况呢？我们翻阅文档，发现自定义部分是大写的`TBD`待定ヾ(｡｀Д´｡)。

那么怎么办呢？我们从官方的Predicate Factory看起，去学习。

挑个简单的`HeaderRoutePredicateFactory`

```java
public class HeaderRoutePredicateFactory extends AbstractRoutePredicateFactory<HeaderRoutePredicateFactory.Config> {

  public static final String HEADER_KEY = "header";
  public static final String REGEXP_KEY = "regexp";

  public HeaderRoutePredicateFactory() {
    super(Config.class);
  }

  @Override
  public List<String> shortcutFieldOrder() {
    return Arrays.asList(HEADER_KEY, REGEXP_KEY);
  }

  @Override
  public Predicate<ServerWebExchange> apply(Config config) {
    boolean hasRegex = !StringUtils.isEmpty(config.regexp);

    return exchange -> {
      List<String> values = exchange.getRequest().getHeaders()
          .getOrDefault(config.header, Collections.emptyList());
      if (values.isEmpty()) {
        return false;
      }
      // values is now guaranteed to not be empty
      if (hasRegex) {
        // check if a header value matches
        return values.stream().anyMatch(value -> value.matches(config.regexp));
      }

      // there is a value and since regexp is empty, we only check existence.
      return true;
    };
  }

  @Validated
  public static class Config {

    @NotEmpty
    private String header;

    private String regexp;

    public String getHeader() {
      return header;
    }

    public Config setHeader(String header) {
      this.header = header;
      return this;
    }

    public String getRegexp() {
      return regexp;
    }

    public Config setRegexp(String regexp) {
      this.regexp = regexp;
      return this;
    }

  }

}
```
上面的例子，我们可以看出
- HeaderRoutePredicateFactory的构造方式与继承类视乎是固定的，目的是传递配置类
- 需要实现`Predicate<ServerWebExchange> apply(Consumer<C> consumer)`
- shortcutFieldOrder()似乎是为了配置值与配置类属性对应的
- 需要定义接受的配置类
- 查看继承可以发现，它通过`NameUtils.normalizeRoutePredicateName(this.getClass())`来获取配置文件中的名称

Okay，验证上面的内容，我们重新编写一个`NonHeaderRoutePredicateFactory`，与head取反。同时配置类属性的交换位置。
```java
public class NonHeaderRoutePredicateFactory extends AbstractRoutePredicateFactory<NonHeaderRoutePredicateFactory.Config> {

  public static final String HEADER_KEY = "header";
  public static final String REGEXP_KEY = "regexp";

  public NonHeaderRoutePredicateFactory() {
    super(Config.class);
  }
  @Override
  public List<String> shortcutFieldOrder() {
    return Arrays.asList(HEADER_KEY, REGEXP_KEY);
  }
  @Override
  public Predicate<ServerWebExchange> apply(Config config) {
    boolean hasRegex = !StringUtils.isEmpty(config.regexp);
    return exchange -> {
      List<String> values = exchange.getRequest().getHeaders().getOrDefault(config.header, Collections.emptyList());
      if (values.isEmpty()) {
        return true;
      }
      if (hasRegex) {
        return values.stream().noneMatch(value -> value.matches(config.regexp));
      }
      return false;
    };
  }
  @Data
  @Validated
  public static class Config {
    private String regexp;
    @NotEmpty
    private String header;
  }
}
```

配置添加`- NonHeader=tt`，当存在`tt`header时 `404 ERROR`，不存在时，正常访问。符合推测！

# GatewayFilter Factory

除此predicates外，还有filter，用于过滤请求。与predicates一样，Spring官方也提供了需要内置的过滤器。过滤器部分相对于predicates来说难得多，有全局的也有可配置的。甚至一些过滤器不支持通过配置文件来修改。

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: example
        uri: http://example.org
        filters:
          # 先介绍简单的路由器
          # 对header的操作（添加，删除，设置），以及保留原始host的header
          - AddRequestHeader=X-Request-Foo, Bar
          - AddResponseHeader=X-Response-Foo, Bar
          - RemoveRequestHeader=X-Request-Foo
          - RemoveResponseHeader=X-Response-Foo
          - RewriteResponseHeader=X-Response-Foo, , password=[^&]+, password=***
          - SetResponseHeader=X-Response-Foo, Bar
          - PreserveHostHeader
          # 对查询参数的过滤
          - AddRequestParameter=foo, bar
          # 对Uri的过滤（path与status）
          - PrefixPath=/mypath
          - RewritePath=/foo/(?<segment>.*), /$\{segment}
          - SetPath=/{segment}
          - StripPrefix=2
          - SetStatus=BAD_REQUEST
          - SetStatus=401
          - RedirectTo=302, http://acme.org
          # 保留session，默认情况下是不保留的
          - SaveSession
          # 设置最大请求数据大小，这里发现一种新写法，理论上predicates中也能使用
          - name: RequestSize
            args:
              maxSize: 5000000
          # 重试次数设置
          - name: Retry
            args:
              retries: 3
              statuses: BAD_GATEWAY
        
          # 断路器的配置
          # 断路器的配置比较复杂，首先指定断路器命令名即可启用断路器（这块我也不熟，需要HystrixCommand的内容）
          - Hystrix=myCommandName
          # 另外我们可以设置些错误发生后的跳转，当然现在仅支持forward:
          - name: Hystrix
            args:
              name: fallbackcmd
              fallbackUri: forward:/incaseoffailureusethis
          # 我们还可以修改错误信息放置的header
          - name: FallbackHeaders
            args:
              executionExceptionTypeHeaderName: Test-Header
              executionExceptionMessageHeaderName: Test-Header
              rootCauseExceptionTypeHeaderName: Test-Header
              rootCauseExceptionMessageHeaderName: Test-Header

           # 另一块比较困难的是速率限制
          # 它由RateLimiter的实现来完成的，默认只支持redis，需要添加`spring-boot-starter-data-redis-reactive`依赖
          # 我们需要提供KeyResolver的实现，因为默认会使用PrincipalNameKeyResolver，在不使用Spring Security的情况下几乎不会用到Principal
          # 除此外，我们也可以提供自定义的RateLimiter，#{@myRateLimiter}是一个SpEL表达式，用于从Spring上下文内读取bean
          - name: RequestRateLimiter
            args:
              redis-rate-limiter.replenishRate: 10
              redis-rate-limiter.burstCapacity: 20
          - name: RequestRateLimiter
            args:
              rate-limiter: "#{@myRateLimiter}"
              key-resolver: "#{@userKeyResolver}"
```

KeyResolver的实现参考
```java
@Bean
KeyResolver userKeyResolver() {
    return exchange -> Mono.just(exchange.getRequest().getQueryParams().getFirst("user"));
}
```

除此外还有两个“特别”的过滤器，`modifyRequestBody` `modifyResponseBody`他们只能使用在Fluent Java Routes API中。例如：

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("rewrite_request_obj", r -> r.host("*.rewriterequestobj.org")
            .filters(f -> f.prefixPath("/httpbin")
                .modifyRequestBody(String.class, Hello.class, MediaType.APPLICATION_JSON_VALUE,
                    (exchange, s) -> return Mono.just(new Hello(s.toUpperCase())))).uri(uri))
        .build();
}
```

此外，这两个过滤器目前处在Beta中，不稳定。而且，Spring团队对于Body的处理十分愚蠢，我会在Others章节提及。

对于全局过滤器，目前系统提供的一般都用于支持基础功能。如负载均衡、路由转换、生成Response等等。对于我们来说，需要关心这些全局过滤器的顺序，毕竟他们与上面的过滤器会一同工作。

与predicates类似，filter也提供了自定义的能力，相对于鸡肋的predicate的自定义，filter显得有用的多。也可能因此，它居然有官方文档介绍（在predicate中是TBD）。我们可以使用它来完成权限的鉴定与下发，一个好的方案是，网关与客户端之间通过session保存用户的登录状态，在网关内，微服务间的沟通使用JWT来认证安全信息。那么我们需要由过滤器来完成这些工作，一个例子如下：

```java
@Configuration
public class GenerateJwtGatewayFilterFactory extends AbstractGatewayFilterFactory<GenerateJwtGatewayFilterFactory.Config> {

    @Resource
    private JwtProperties properties;
    @Resource
    private JwtAuthServer jwtAuthServer;

    public GenerateJwtGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public String name() {
        return "GenerateJwt";
    }

    @Override
    public GatewayFilter apply(Config config) {

        String[] place = config.getPlace().split(":");

        return (exchange, chain) -> {
            return Mono
                    .defer(() -> {
                        if ("session".equals(place[0])) {
                            return exchange.getSession().map(webSession -> {
                                return webSession.getAttributes().getOrDefault(place[1], "");
                            });
                        }
                        if ("query".equals(place[0])) {
                            String first = exchange.getRequest().getQueryParams().getFirst(place[1]);
                            return Mono.justOrEmpty(first);
                        }
                        if ("form".equals(place[0])) {
                            /*return exchange.getFormData().map(formData -> {
                                String first = formData.getFirst(place[1]);
                                return Optional.ofNullable(first).orElse("");
                            });*/
                            return new DefaultServerRequest(exchange).bodyToMono(new ParameterizedTypeReference<MultiValueMap<String, String>>() {}).map(formData -> {
                                String first = formData.getFirst(place[1]);
                                return Optional.ofNullable(first).orElse("");
                            });
                        }
                        throw new BaimiException("不支持的类型！");
                    })
                    .filter(sub -> !StringUtils.isEmpty(sub))
                    .map(sub -> jwtAuthServer.generate(config.getAudience(), config.getPrefix() + ":" + sub))
                    .map(token -> exchange.getRequest().mutate().header(properties.getHeaderName(), properties.getHeaderPrefix() + token).build())
                    .map(req -> exchange.mutate().request(req).build())
                    .then(chain.filter(exchange));
        };
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("place", "audience", "prefix");
    }

    @Data
    static class Config {
        /**
         * 三种类型的位置.
         * - session:<param>
         * - query:<param>
         * - form:<param>
         */
        private String place = "session:user";
        /**
         * 授权对象
         * system: 系统用户
         * wechat: 微信用户
         * etc
         */
        private String audience = "system";
        /**
         * 授权主体标识
         */
        private String prefix = "id";
    }
}
```

在配置文件中，直接使用，更多代码见下面参考中的项目源码。

```yml
spring:
  cloud:
    gateway:
      routes:
        - id: example
          uri: http://example.org
          filters:
            - GenerateJwt=form:id,system,id
```

全局的过滤器也能自定义，像下面一样

```java
@Bean
@Order(1)
public GlobalFilter c() {
    return (exchange, chain) -> {
        log.info("third pre filter");
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            log.info("first post filter");
        }));
    };
}
```

# Others

## Fluent Java Routes API

关于Java DSL，个人是极度不推荐使用。由于修改后需要重新打包部署。如果由配置文件决定，我们仅需修改配置文件，重新运行即可，程序会更加稳定，因为它仅提供功能给配置文件使用。

## Request/Response Body

> IllegalStateException 问题范围为 Spring Cloud Gateway 2.0.0 至 2.1.1，1.x 理论上正常但未测试，2.1.2已修复。

关于Body，Spring对于其的操作是，在最初始化阶段，读取Body内容放入Flux流中。之后都是对其操作。详细可以看下`AdaptCachedBodyGlobalFilter`全局过滤器的源码。

似乎没什么问题是吧，我们就应该在这个操作流内不断的修改Body的内容，直至其被最终消费（转发）。但是当我们在过滤中使用`exchange.getRequest().getBody()`或者`exchange.getFormData()`之后，我们期望后续Spring是读取我们所产生的流，然而事实上，它仍然产生调用`getBody()`获取最初的流。流是线性的，已消费过的不能再次被消费！所以，我们无法方便的使用它达到我们的目的（当然Java DSL内有提供内置的过滤器，但我不推荐Java DSL本身）。

对此，我们有两种方案解决这个问题
1. 处理完成后的流放入Request/Response中，以便其后续的消费
2. 修改getBody()的行为，缓存body内容，且每次生成新的流支持后续操作

由于Request/Response对应的Builder不支持放入Body，所有，方案一每次都需要重新构建Body解码器，就像`modifyRequestBody`做的一样。。。在不需要修改Body的内容的前提（大部分都是这样的）下，方案二我们可以写成通用的Factory，在适当的位置添加即可，显得更加可操作。

下面是一个filter，用于支持RequestBody的缓存：

```java
@Configuration
public class CacheRequestGatewayFilterFactory extends AbstractGatewayFilterFactory<CacheRequestGatewayFilterFactory.Config> {

    public CacheRequestGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public String name() {
        return "CacheRequest";
    }

    @Override
    public GatewayFilter apply(Config config) {
        CacheRequestGatewayFilter cacheRequestGatewayFilter = new CacheRequestGatewayFilter();
        Integer order = config.getOrder();
        if (order == null) {
            return cacheRequestGatewayFilter;
        }
        return new OrderedGatewayFilter(cacheRequestGatewayFilter, order);
    }

    public static class CacheRequestGatewayFilter implements GatewayFilter {
        @Override
        public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

            //GET DELETE 不过滤
            HttpMethod method = exchange.getRequest().getMethod();
            if (method == null || method.matches("GET") || method.matches("DELETE")) {
                return chain.filter(exchange);
            }

            return DataBufferUtils.join(exchange.getRequest().getBody())
                    .map(dataBuffer -> {
                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                        dataBuffer.read(bytes);
                        DataBufferUtils.release(dataBuffer);
                        return bytes;
                    })
                    .defaultIfEmpty(new byte[0])
                    .flatMap(bytes -> {
                        DataBufferFactory dataBufferFactory = exchange.getResponse().bufferFactory();
                        ServerHttpRequestDecorator decorator = new ServerHttpRequestDecorator(exchange.getRequest()) {
                            @Override
                            public Flux<DataBuffer> getBody() {
                                if (bytes.length > 0) {
                                    return Flux.just(dataBufferFactory.wrap(bytes));
                                }
                                return Flux.empty();
                            }
                        };
                        return chain.filter(exchange.mutate().request(decorator).build());
                    });
        }
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Collections.singletonList("order");
    }

    @Data
    static class Config {
        private Integer order;
    }

}
```

配置文件添加CacheRequest，用于添加过滤器（如果不加，从form中读取数据是会报错的）

```yml
spring:
  cloud:
    gateway:
      routes:
        - id: jwt
          uri: lb://app-name
          predicates:
            - Path=/jwt/**
          filters:
            - CacheRequest
            - GenerateJwt=form:id,system,id
```

当然，`exchange.getFormData()`的问题没有解决，需要对Body操作，请使用`exchange.getRequest().getBody()`

> 在下方 issues:946 提了简化操作的建议，然后官方添加了相关Cache方法，然后发现不使用这个方法也不出问题。。。问题原因就是`AdaptCachedBodyGlobalFilter`对body解码器的封装，默认情况下2.1.2中不做处理，所以好了。。。

# 参考
- [项目源码](https://github.com/jiangtj-lab/spring-cloud-gateway-example)
- [官方文档](https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.1.0.RELEASE/single/spring-cloud-gateway.html#_modify_request_body_gatewayfilter_factory)
- [issues:946 关于Body流操作需要简化的建议](https://github.com/spring-cloud/spring-cloud-gateway/issues/946)
