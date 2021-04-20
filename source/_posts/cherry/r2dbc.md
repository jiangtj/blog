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

JPA 中的关系映射，如 `@ManyToOne` `@OneToMany`等也不支持的，所以遇到有关联的时候，需要我们自己处理

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

`one()` 不是 `limit 1`，只是表示断言获取到的数据是一条。。。

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

官方不支持Page<T>，原因在于生成Page<T>需要提前消费Flux<T>的数据，这是不推荐的，我们可以分成两个接口，一个用于获取数据，一个用于获取总数。但是在某些场景下，比如后台，对于性能要求不是很高，而且现有的框架已经对Page数据格式支持了，那么我们自然希望仍旧返回Page。

我创建一个`PageQueryBuilder`，生成Page

```java
import static org.springframework.data.relational.core.query.Query.query;

public class PageQueryBuilder<T> {

    private final R2dbcEntityTemplate template;
    private final Class<T> clz;
    private Criteria criteria;
    private Pageable pageable;

    public PageQueryBuilder(R2dbcEntityTemplate template, Class<T> clz) {
        this.template = template;
        this.clz = clz;
    }

    public PageQueryBuilder<T> where(Criteria criteria) {
        this.criteria = criteria;
        return this;
    }

    public PageQueryBuilder<T> pageable(Pageable pageable) {
        this.pageable = pageable;
        return this;
    }

    public Mono<Page<T>> apply() {
        return Mono.zip(selectList(), selectCount())
            .map(tuple -> new PageImpl<>(tuple.getT1(), pageable, tuple.getT2()));
    }

    public <R> Mono<Page<R>> apply(Function<List<T>, Mono<List<R>>> fn) {
        return Mono.zip(selectList().flatMap(fn), selectCount())
            .map(tuple -> new PageImpl<>(tuple.getT1(), pageable, tuple.getT2()));
    }

    public <R> Mono<Page<R>> flatTuple(Function<Tuple2<List<T>, Long>, Mono<Tuple2<List<R>, Long>>> fn) {
        return Mono.zip(selectList(), selectCount())
            .flatMap(fn)
            .map(tuple -> new PageImpl<>(tuple.getT1(), pageable, tuple.getT2()));
    }

    private Mono<List<T>> selectList() {
        return template.select(clz)
            .matching(query(criteria).with(pageable))
            .all()
            .collectList();
    }

    private Mono<Long> selectCount() {
        return template.select(clz)
            .matching(query(criteria))
            .count();
    }
}
```

这样我们可以轻松的实现获取page

```java
Page<Persion> page = new PageQueryBuilder<>(template, Persion.class)
  .where(where("name").is("John"))
  .pageable(pageable)
  .apply();
```

# 非Null字段更新

R2DBC 添加是对于所以非null的字段生成sql添加，但是，更新是所有非@Id字段更新，但是我们经常会对于非null的数据更新，忽略null字段，所以我又写了个工具。。。

```java
public interface DbUtils {
  
    List<String> ignoreDescriptors = Arrays.asList("class");

    static <T> Mono<Integer> update(R2dbcEntityTemplate template, T entity) {
        PropertyDescriptor[] descriptors = BeanUtils.getPropertyDescriptors(entity.getClass());
        Update update = null;
        Query query = null;
        for (PropertyDescriptor descriptor: descriptors) {
            try {
                String name = descriptor.getName();

                if (ignoreDescriptors.contains(name)) {
                    continue;
                }

                Object invoke = descriptor.getReadMethod().invoke(entity);
                if (invoke == null) {
                    continue;
                }
                if ("id".equals(name)) {
                    query = query(Criteria.where(name).is(invoke));
                } else {
                    update = update == null? Update.update(name, invoke):
                        update.set(name, invoke);
                }
            } catch (IllegalAccessException | InvocationTargetException e) {
                e.printStackTrace();
            }
        }

        if (query == null || update == null) {
            return Mono.error(new BadRequestException("无法生成有效的Sql语句！"));
        }

        return template.update(entity.getClass())
            .matching(query)
            .apply(update);
    }
}
```

下面是使用例子

```java
DbUtils.update(template, persion)
```

# 总结

我甚至希望 Spring 能放弃对 Repositories 的支持，专心完善它的 Fluent API，可惜我在官方仓库中看到的基本都是提 Repositories 的需求，其实我也一样，一般情况 JPA 转过去的，都是先看有什么一样的API，方便入手，可是实际体验，还是Fluent API更加香啊
