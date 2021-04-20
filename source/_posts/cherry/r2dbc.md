---
title: R2DBC-传统数据库也能响应式编程
categories: [后端]
tags: [Webflux, R2DBC]
date: 2021-04-20 16:44:55
updated: 2021-04-20 16:44:55
---

R2DBC 是 Reactive Relational Database Connectivity （关系型数据库的响应式连接） 的缩写，最近在项目中尝试 Webflux，被迫，使用 R2DBC 进行数据库操作（我还是更喜欢关系型数据库而不是文档型）。当然在实际使用后，发现这个框架虽然有些不足，但这才是我喜欢的DB框架

这里零散的记录下我遇到的一些问题，或者钟爱的一些特性，或者自己写的小工具

<!-- more -->

# Repositories 未完整支持

我是从Spring Data JPA迁移过来的，第一件是，就是看它的Repositories该如何去定义，怎么获取数据库中的内容。

## 领域模型描述方式少

首先，R2DBC未引入`javax.persistence`，所以需要使用 Spring Data 中定义的注解，Spring Data 中的注解很少，这意味着，这个框架目前它比 JPA 能做的事情少很多，比如自动生成表（我相信在实际项目中很少这么做吧）

```java
@Data
@Table
public class AdminUser {
    @Id
    private Long id;
    private String username;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private Integer isDeleted;
}
```

但同样的，最简单的模型的代码简洁太多了，它就是一个普通的Java对象加个`@Id`注解（`@Table`可以不添加的，无影响，但是官方文档建议加上，`@Data` 是Lombok注解），目前 R2DBC 只支持以下注解

- @Id: 定义那个是主键.
- @Table: 可以用来指定表名.
- @Transient: 不需要映射的字段，与JPA中一样.
- @PersistenceConstructor: 如果有多个构造方法，可以用它指定某个用于读取数据后的转换.
- @Value: 提供使用SpEL语法，获取数据的方式.
- @Column: 定义列名.
- @Version: 用于乐观锁的（暂时未尝试）.

JPA 中的关系映射，如 `@ManyToOne` `@OneToMany`等，所以遇到有关联的时候，需要我们自己处理

## 不支持 Page<T> 与 Specifications

在 JPA 中，我使用 Specifications 来查询分页内容，例如

```java
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
 …
}

Page<Customer> page = CustomerRepository.findAll(spec, pageable);
```

实现分页很容易，虽然 Specification 写起来也有点烦

`ExampleMatcher` 需要候选版的Spring Boot，最近的 R2DBC 已经支持了 `ExampleMatcher`，但 Spring Boot 中还未升级，它需要 `Spring Boot 2.5+` 但目前还只是 `Spring Boot 2.4.5`

# Fluent API

R2DBC 的 Repositories 支持的确太差，甚至，我都差点放弃，但 R2DBC 还支持另一种查询方式，也就是 Fluent API，先看一个例子

```java
Mono<Person> first = template.select(Person.class)  
  .from("other_person")
  .matching(query(where("firstname").is("John")     
    .and("lastname").in("Doe", "White"))
    .sort(by(desc("id"))))                          
  .one(); 
```

不需要做任何说明，我相信你们都能理解这行代码的意思

```sql
select * 
  from other_person
  where firstname = John
    and lastname in ("Doe", "White")
    order by id desc
```

`one()` 不是 `limit 1`，只是表示获取到的数据是一条。。。

Fluent API 其实相当于 JAP 中 Specifications，也就是 Hibernate 中的 Criteria，目的是为了提供类型安全的查询，但是相对于 Hibernate 来说简单太多了

```java
// Hibernate
CriteriaBuilder builder = entityManager.getCriteriaBuilder();
CriteriaQuery<Person> criteria = builder.createQuery( Person.class );
Root<Person> root = criteria.from( Person.class );
criteria.select( root );
criteria.where( builder.equal( root.get( Person_.name ), "John Doe" ) );
List<Person> persons = entityManager.createQuery( criteria ).getResultList();
```

Fluent API 拥有接近原生SQL的写法表现，同时还能保证类型安全，未来，它必定比Mybatis还要更加优秀（未来的原因是目前无法完整支持sql语法，比如join），我使用 R2DBC 的项目已经全部使用 Fluent API 进行数据库操作而不是半残的 Repositories

# 分页支持

官方不支持Page<T>，原因在于生成Page<T>需要提前消费Flux<T>的数据，这是不推荐的，但是在某些场景下
