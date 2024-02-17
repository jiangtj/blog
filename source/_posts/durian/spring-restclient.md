---
title: Spring 6.1 新的 Web 客户端 RestClient
categories: [后端]
tags: [Spring]
date: 2024-02-17 12:33:19
updated: 2024-02-17 12:33:19
---

在 Spring 6.1 中，添加了一个新的同步 web 客户端 RestClient，提供更现代化的 fluent API，所以我们能在 spring mvc 里获得与 webflux 一样的 web 请求的编码体验（再加上 project loom 的支持，webflux 还有存在的意义么？）

# 创建 RestClient

RestClient 可以用过 `create()` 方法直接简单的创建，也可以通过 `builder()` 构建。在 `builder()` 中，我们可以传入一些配置或者默认参数，这对于我们统一请求规范有很大的帮助

```java
RestClient defaultClient = RestClient.create();

RestClient customClient = RestClient.builder()
  .requestFactory(new HttpComponentsClientHttpRequestFactory())
  .messageConverters(converters -> converters.add(new MyCustomMessageConverter()))
  .baseUrl("https://example.com")
  .defaultUriVariables(Map.of("variable", "foo"))
  .defaultHeader("My-Header", "Foo")
  .requestInterceptor(myCustomInterceptor)
  .requestInitializer(myCustomInitializer)
  .build();
```

<!-- more -->

# 使用 RestClient

```java
Pet pet = restClient.post()
  .uri("https://petclinic.example.com/pets/new") 
  .contentType(APPLICATION_JSON) 
  .body(pet) 
  .retrieve()
  .body(Pet.class);
```

RestClient 的 API 与 WebClient 的 API 很相似，除了返回值， WebClient 返回的是 Mono、Flux，而 RestClient 返回的是实体类（毕竟是同步请求，会阻塞直接获取结果）。

# HTTP Interface

事实上在使用 Spring Boot 中，如果我们需要用到请求数据，一般而言，我们都会引入第三方的库，比如 OpenFeign、Retrofit 等，毕竟这些框架提供了通过接口的方式，定义请求，但现在 Spring 本身也支持了，或许在大部分项目中，我们可以使用 Spring 的而不在需要引入第三方的库。

```java
interface RepositoryService {

	@GetExchange("/repos/{owner}/{repo}")
	Repository getRepository(@PathVariable String owner, @PathVariable String repo);

	// more HTTP exchange methods...

}
```

```java
@HttpExchange(url = "/repos/{owner}/{repo}", accept = "application/vnd.github.v3+json")
interface RepositoryService {

	@GetExchange
	Repository getRepository(@PathVariable String owner, @PathVariable String repo);

	@PatchExchange(contentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	void updateRepository(@PathVariable String owner, @PathVariable String repo,
			@RequestParam String name, @RequestParam String description, @RequestParam String homepage);

}
```

在 RestClient 我们可以通过以下配置，来获得代理实现

```java
RestClient restClient = RestClient.builder().baseUrl("https://api.github.com/").build();
RestClientAdapter adapter = RestClientAdapter.create(restClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```

当然不仅仅是 RestClient， 在 WebClient 和 RestTemplate 中，我们也同样可以通过接口来定义请求。

```java
WebClient webClient = WebClient.builder().baseUrl("https://api.github.com/").build();
WebClientAdapter adapter = WebClientAdapter.create(webClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory("https://api.github.com/"));
RestTemplateAdapter adapter = RestTemplateAdapter.create(restTemplate);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```