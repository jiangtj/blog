---
title: Spring Cloud 平台搭建(四)：Spring Boot Admin
categories: [后端]
tags: [Spring Cloud 平台搭建]
date: 2023-04-07 14:21:38
updated: 2023-04-07 14:21:38
description:
---

> 源码：[J Cloud Platform](https://github.com/jiangtj/jc-platform)，期待你们的star ٩(๑❛ᴗ❛๑)۶

Spring Boot Admin 是简单，同时功能也比较全面的监控服务，所以对于快速搭建微服务框架来说，是最佳的。比如 ELK Stack 能更好的处理日志，以及一些运行数据，但是，他需要配置，同时，对于少量的微服务显得笨重，而且后期加难度也不大。

老规矩，先让AI介绍下概念，这是换成了Notion AI，我也不知道为啥我bing用不了了。。。

# 概念

Spring Boot Admin是一个开源的第三方监控工具，可以用于管理和监控Spring Boot应用程序。它提供了一个简单易用的Web用户界面，让开发者可以轻松地查看应用程序的运行状况、性能指标、日志信息等。

<!-- more -->

Spring Boot Admin的主要特点包括：

- 易于配置和使用：只需要将Spring Boot Admin Server添加到Spring Boot应用程序中即可，无需任何额外的配置。
- 提供丰富的监控指标：可以查看应用程序的运行状况、内存使用情况、线程数、HTTP请求统计、数据库连接池状态等。
- 支持实时日志查看：可以查看应用程序的标准输出、错误输出和日志文件。
- 提供邮件和Slack通知功能：可以在应用程序发生故障或异常时发送邮件或Slack消息通知开发者。
- 支持集群监控：可以同时监控多个Spring Boot应用程序，并对它们进行统一管理。

总之，Spring Boot Admin是一个功能强大、易于使用、高度可定制化的监控工具，可以帮助开发者更好地管理和监控Spring Boot应用程序的运行状态，提高应用程序的可靠性和稳定性。

# 搭建 SBA Server

创建一个`sba-server`模块，像`base-reactive`一样，并添加`spring-boot-admin-starter-server` `spring-boot-starter-security`依赖

```xml
<!-- sba 与 security -->
<dependency>
	<groupId>de.codecentric</groupId>
	<artifactId>spring-boot-admin-starter-server</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-security</artifactId>
</dependency>
<!-- 服务注册发现的依赖 -->
<dependency>
	<groupId>com.tencent.cloud</groupId>
	<artifactId>spring-cloud-starter-tencent-polaris-discovery</artifactId>
</dependency>
<dependency>
	<groupId>com.tencent.cloud</groupId>
	<artifactId>spring-cloud-starter-tencent-polaris-config</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

添加`bootstrap.yml`文件

```yml
spring:
  application:
    name: sba-server
  cloud:
    polaris:
      address: grpc://localhost:18091
      namespace: default
      config:
        address: grpc://localhost:18093
        auto-refresh: true
  config:
    import:
      - optional:polaris:dev:auth.properties
```

添加启用注解

```java
@SpringBootApplication
@EnableAdminServer
@EnableDiscoveryClient
public class SBAServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(SBAServerApplication.class, args);
	}

}
```

添加`spring security`的拦截器

```java
@Configuration(proxyBeanMethods = false)
public class SecuritySecureConfig {

    private final AdminServerProperties adminServer;

    public SecuritySecureConfig(AdminServerProperties adminServer) {
        this.adminServer = adminServer;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChainSecure(ServerHttpSecurity http) {
        return http
            .authorizeExchange(
                (authorizeExchange) -> authorizeExchange.pathMatchers(this.adminServer.path("/assets/**"))
                    .permitAll()
                    .pathMatchers("/actuator/health/**")
                    .permitAll()
                    .pathMatchers(this.adminServer.path("/login"))
                    .permitAll()
                    .anyExchange()
                    .authenticated())
            .formLogin((formLogin) -> formLogin.loginPage(this.adminServer.path("/login"))
                .authenticationSuccessHandler(loginSuccessHandler(this.adminServer.path("/"))))
            .logout((logout) -> logout.logoutUrl(this.adminServer.path("/logout"))
                .logoutSuccessHandler(logoutSuccessHandler(this.adminServer.path("/login?logout"))))
            .httpBasic(Customizer.withDefaults())
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .build();
    }

    // The following two methods are only required when setting a custom base-path (see
    // 'basepath' profile in application.yml)
    private ServerLogoutSuccessHandler logoutSuccessHandler(String uri) {
        RedirectServerLogoutSuccessHandler successHandler = new RedirectServerLogoutSuccessHandler();
        successHandler.setLogoutSuccessUrl(URI.create(uri));
        return successHandler;
    }

    private ServerAuthenticationSuccessHandler loginSuccessHandler(String uri) {
        RedirectServerAuthenticationSuccessHandler successHandler = new RedirectServerAuthenticationSuccessHandler();
        successHandler.setLocation(URI.create(uri));
        return successHandler;
    }
}
```

配置`spring security`的用户名与密码

```properties
spring.security.user.name=admin
spring.security.user.password=123456
```

okay，运行后就可以在浏览器打开了

# 总结

有一说一。spring boot admin的ui还是很现代化的，这种风格我还是蛮喜欢的

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230407153042.png)
![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230407153058.png)
![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230407153111.png)
![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230407153131.png)

其实，安全这部分还没开发完成，你可以看到用的是官方的例子，这是由于整体的安全框架还未搭建完成。我后面还会继续修改这部分内容，具体的内容可能得在后面安全框架介绍时再讲了
