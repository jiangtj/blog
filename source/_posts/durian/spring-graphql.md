---
title: 为 Spring Boot 应用添加 GraphQL
categories: [后端]
tags: [Spring]
date: 2023-08-16 09:50:35
updated: 2023-08-21 09:44:35
description:
---

GraphQL 已经出现很久了，最近我在看 Spring 文档时，看到了相关的介绍（我记得以前是没的，不知道什么时候的新特性），就试了试，先来一段AI的介绍。如果你仅想看怎么实现，跳过下面这段

# 来着 Codeium AI 的介绍

GraphQL是一种用于API开发的查询语言和运行时环境。它由Facebook开发并于2015年开源。GraphQL的主要目标是提供一种更高效、灵活和易于使用的方式来获取和操作数据。与传统的RESTful API相比，GraphQL允许客户端精确地指定需要的数据，并减少了不必要的网络传输和数据处理。

<!-- more -->

GraphQL的核心思想是客户端通过发送查询请求来获取所需的数据，而服务器则返回与请求匹配的结果。客户端可以精确地指定需要的字段和关联关系，而不需要在每个请求中获取整个对象的所有属性。这样可以避免过度获取不需要的数据，并减少网络传输和服务器负载。

GraphQL还提供了强大的类型系统，允许定义字段的类型和验证规则。这样可以在编译时检测错误，并提供更好的开发体验和文档。

总而言之，GraphQL是一种现代化的API查询语言和运行时环境，它提供了更高效、灵活和易于使用的方式来获取和操作数据。它已经被广泛采用，并在许多大型应用程序中取得了成功。

# 创建 GraphQL schema

以 [我的一个项目](https://github.com/jiangtj/api-core) 为例，为省市区的接口创建GraphQL

首先，在 `resources/graphql/` 下，创建 `address.graphqls` （后缀也可以是`.gqls`）

```graphqls
type Query {
    provinces: [Province!]!
    province(code: ID!): Province
    city(code: ID!): City
    area(code: ID!): Area
}

type Province {
    code: ID!
    name: String!
    cities: [City!]!
}

type City {
    code: ID!
    name: String!
    provinceCode: Int!
    areas: [Area!]!
}

type Area {
    code: ID!
    name: String!
    cityCode: Int!
    provinceCode: Int!
}
```

GraphQL 有两个入口，一个 Query 用于查询数据， 一个是 Mutation 用于更新对象，基础类型叫 Scalars，默认有以下六种 ID，String，Int，Float，Boolean，List。除了ID，其他都是很熟悉的，ID在 GraphQL 中等价于 String，不同的是ID是唯一的，所以可以作为Cache的依据

# 配置 RuntimeWiringConfigurer

Spring GraphQL 会依据配置好的 RuntimeWiringConfigurer 获取数据，使用dataFetcher获取type中对应field内容，我们可以通过environment获取GraphQL的上下文内容，比如`getArgument`获取参数值

```java
@Configuration
public class AddressGraphQlConfiguration {

    @Bean
    RuntimeWiringConfigurer customWiringConfigurer(AddressService addressService) {
        return wiringBuilder -> wiringBuilder
                .type("Query", builder -> builder
                        .dataFetcher("provinces", environment -> {
                            return addressService.getProvinces();
                        })
                        .dataFetcher("province", environment -> {
                            String code = environment.getArgument("code");
                            return addressService.getProvince(Integer.parseInt(code)).orElseThrow();
                        })
                        .dataFetcher("city", environment -> {
                            String code = environment.getArgument("code");
                            return addressService.getCity(Integer.parseInt(code)).orElseThrow();
                        })
                        .dataFetcher("area", environment -> {
                            String code = environment.getArgument("code");
                            return addressService.getArea(Integer.parseInt(code)).orElseThrow();
                        }))
                .type("Province", builder -> builder
                        .dataFetcher("cities", environment -> {
                            Province source = environment.getSource();
                            return addressService.getCitiesByPCode(source.code());
                        }))
                .type("City", builder -> builder
                        .dataFetcher("areas", environment -> {
                            City source = environment.getSource();
                            return addressService.getAreasByPCode(source.code());
                        }));
    }

}
```

Spring 也支持注解形式配置，例如

```java
@Controller
public class GreetingController {

        @QueryMapping 
        public String hello() { 
            return "Hello, world!";
        }

        @SchemaMapping(typeName="Greeting", field="author")
        public Author getAuthor(Greeting greeting) {
            // ...
        }
    
}
```

Spring 会使用内置的`AnnotatedControllerConfigurer`，配置所有注解的到RuntimeWiring中，所以上面等价于

```java
@Bean
RuntimeWiringConfigurer customWiringConfigurer() {
    return wiringBuilder -> wiringBuilder
            .type("Query", builder -> builder
                    .dataFetcher("hello", environment -> {
                        return "Hello, world!";
                    }))
            .type("Greeting", builder -> builder
                    .dataFetcher("author", environment -> {
                        Greeting source = environment.getSource();
                        // ...
                    }));
}
```

`@QueryMapping` 等价于 `@SchemaMapping(typeName="Query")`,`field`如果没有定义，会获取方法名，`typeName`同理，会获取Controller的前面的名字

# 总结

上面的代码在我的项目[Api Core](https://github.com/jiangtj/api-core)中，需要参考的可以去看看，我对于GraphQL的评价是，它确实能实现，所要即所得，不会返回多于的数据，但是，在一定程度上隐藏了对象之间的复杂性，这对应编程人员来说要求会更高

举个例子，上面的服务如果获取全部的省市区数据

```
{
    provinces {
        code
        name
        cities {
            code
            name
            areas {
                code
                name
            }
        }
    }
}

```

这会对每个Province实例调用`Province`中定义`cities`，在`City`也一样，所以，一旦在type中直接使用了调用数据库的查询，那么这就等于for循环里不断的调用，所以需要使用 `DataLoader` 或者 `@BatchMapping` (是不是相对于RESTFul里显性的填充，在GraphQL中更难被察觉)

```java
@Controller
public class BookController {

    public BookController(BatchLoaderRegistry registry) {
        registry.forTypePair(Long.class, Author.class).registerMappedBatchLoader((authorIds, env) -> {
            // return Map<Long, Author>
        });
    }

    @SchemaMapping
    public CompletableFuture<Author> author(Book book, DataLoader<Long, Author> loader) {
        return loader.load(book.getAuthorId());
    }

    // 上面等价于
    @BatchMapping
    public Mono<Map<Book, Author>> author(List<Book> books) {
        // ...
    }

}
```

当然我的那个项目，省市区数据都在内存中，所以可以任性的用在type中直接获取，所以相对于RESTFul来说，各有优劣而已
