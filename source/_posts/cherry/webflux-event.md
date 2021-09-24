---
title: 为 Spring WebFlux 提供 'ApplicationEventPublisher'
categories: [后端]
tags: [WebFlux, Event]
date: 2021-09-24 16:15:07
updated: 2021-09-24 16:15:07
---

在 Spring 中提供了 ApplicationEventPublisher，用于发布事件，这在一些场景下十分有用，比如，当我创建一个货物，而另一个服务监听货物的创建并为其创建库存。所以在Spring MVC中很实用，我也常常用它来解耦，但是当我切换为 WebFlux 时，就尴尬了。因为 ApplicationEventPublisher 是同步操作，它并不支持响应式，即流操作。

所以，我在 WebFlux 中实现一个类似的发布订阅模式，以替代 ApplicationEventPublisher

<!-- more -->

# 实现 Event 服务

我们的事件服务分为3个部分

- 对发布对象的封装
- 设计通用的监听接口
- 提供类似 ApplicationEventPublisher 的对象，发布事件

## ObjectEventNotifier

首先先对发布的对象进行封装，这步就算是 ApplicationEventPublisher，也是无法避免的，不然，你监听到一个对象，但不知道这对象是创建还是删除，这又该做什么处理呢。

```java
public class ObjectEventNotifier<T> implements ResolvableTypeProvider {

    private final T object;
    private final Type type;

    private ObjectEventNotifier(T object, Type type) {
        this.object = object;
        this.type = type;
    }

    public static <T> ObjectEventNotifier<T> from(T object, Type type) {
        return new ObjectEventNotifier<>(object, type);
    }

    @Override
    public ResolvableType getResolvableType() {
        return ResolvableType.forClassWithGenerics(getClass(), ResolvableType.forInstance(object));
    }

    public T getObject() {
        return this.object;
    }

    public Type getType() {
        return this.type;
    }

    public enum Type {
        Create, Update, Delete
    }
}
```

上面的类，依据枚举 Type，对对象进行分类，以便在不同情况下，做不同处理

## EventListener

接下来设计监听接口，一般而言，我们依据类的类型，选择不同的消费者，所以，简单的监听接口如下

```java
public interface EventListener<T> {

    Class<T> target();

    Publisher<Void> consume(ObjectEventNotifier<T> consumer);

}
```

但是这样，存在一个问题，当我们创建监听服务时，就会像下面那样

```java
@Bean
public EventListener<Goods> listener() {
    return new EventListener<>() {
        @Override
        public Class<Goods> target() {
            return Goods.class;
        }
        @Override
        public Publisher<Void> consume(ObjectEventNotifier<Goods> consumer) {
            // ...
        }
    };
}
```

这代码真的是一言难尽，所以，对于监听接口必须提供一个简化版的创建方式

```java
public interface EventListener<T> {
    //...
    static <T> EventListener<T> register(Class<T> target, Function<ObjectEventNotifier<T>, Publisher<Void>> fn) {
        return new EventListener<>() {
            @Override
            public Class<T> target() {
                return target;
            }
            @Override
            public Publisher<Void> consume(ObjectEventNotifier<T> consumer) {
                return fn.apply(consumer);
            }
        };
    }
}

@Bean
public EventListener<Goods> listener() {
    return EventListener.register(Goods.class, notifier -> ...);
}
```

## EventService

最后，实现我们最重要的事件服务，它分为两个部分

- 接受监听服务，并基于类的类型进行分类
- 接受发布对象，封装并依据类型，选择对应的监听服务消费

第一部分，由于我们使用Spring boot，所以，我们可以让spring给我们要的已经创好的监听服务，我们只需要将 EventListener 根据类型不同，放在不同的Map里存储

```java
@Service
public class EventService {

    public Map<String, List<Object>> store = new ConcurrentHashMap<>();

    @SuppressWarnings({"unchecked", "rawtypes"})
    public EventService(List<EventListener> listeners) {
        listeners.forEach(listener -> {
            this.register(listener.target(), listener::consume);
        });
    }

    public <T> void register(Class<T> target, Function<ObjectEventNotifier<T>, Publisher<Void>> consumer) {
        String name = target.getName();
        List<Object> consumers = store.getOrDefault(name, null);
        if (consumers == null) {
            consumers = new ArrayList<>();
            store.put(name, consumers);
        }
        consumers.add(consumer);
    }
}
```

第二部分，这是响应式中的难点，响应式是非阻塞的，所以消费者也需要返回一个非阻塞的结果，之前的接口返回是 `Publisher<Void>`，就是因为这是个未处理完的结果

```java
@Service
public class EventService {

    public Map<String, List<Object>> store = new ConcurrentHashMap<>();

    @SuppressWarnings({"unchecked"})
    public <T> Flux<Void> publish(ObjectEventNotifier.Type type, T target) {
        String name = target.getClass().getName();
        List<Object> consumers = store.getOrDefault(name, null);
        if (consumers == null) {
            return Flux.empty();
        }
        return Flux
            .fromIterable(consumers)
            .flatMap(obj -> {
                Function<ObjectEventNotifier<T>, Publisher<Void>> consumer = (Function<ObjectEventNotifier<T>, Publisher<Void>>) obj;
                Publisher<Void> apply = consumer.apply(ObjectEventNotifier.from(target, type));
                return apply == null ? Mono.empty() : apply;
            });
    }

    public <T> Mono<T> publishCreate(T target) {
        return this.publish(ObjectEventNotifier.Type.Create, target)
            .then(Mono.just(target));
    }

    public <T> Mono<T> publishUpdate(T target) {
        return this.publish(ObjectEventNotifier.Type.Update, target)
            .then(Mono.just(target));
    }

    public <T> Mono<T> publishDelete(T target) {
        return this.publish(ObjectEventNotifier.Type.Delete, target)
            .then(Mono.just(target));
    }

}
```

主要是publish部分的代码，下面的publishCreate等，是为了快捷操作

# 试试写好的 Event 服务

创建一个货物服务

```java
public class GoodsService {

    @Resource
    private EventService eventService;

    public Mono<Goods> createGoods() {
        Goods apple = Goods.of(1, "苹果");
        return Mono.just(apple)
            .flatMap(eventService::publishCreate);
    }

}
```

为 Goods 创建监听服务（创了两个，毕竟这种监听一般都是一对多的嘛）

```java
@Configuration
public class ServerConfiguration {

    @Bean
    public GoodsService goodsService() {
        return new GoodsService();
    }

    @Bean
    public StockService stockService() {
        return new StockService();
    }

    @Bean
    public EventListener<Goods> listener1(StockService stockService) {
        return EventListener.register(Goods.class, stockService::initStockWithGoods1);
    }

    @Bean
    public EventListener<Goods> listener2(StockService stockService) {
        return EventListener.register(Goods.class, stockService::initStockWithGoods2);
    }

}

@Slf4j
public class StockService {

    public Publisher<Void> initStockWithGoods1(ObjectEventNotifier<Goods> notifier) {
        ObjectEventNotifier.Type type = notifier.getType();
        if (type == ObjectEventNotifier.Type.Create) {
            log.error("Create stock for: " + notifier.getObject().getName());
            return Mono.just(Stock.of(1, 0)).then();
        }
        return Mono.empty();
    }

    public Publisher<Void> initStockWithGoods2(ObjectEventNotifier<Goods> notifier) {
        log.error("Another listener for Goods: " + notifier.getObject().getName());
        return Mono.empty();
    }

}
```

创建一个测试用例，调用创建苹果

```java
@SpringBootTest
class GoodsServiceTest {

    @Resource
    GoodsService goodsService;

    @Test
    void createGoods() {
        goodsService.createGoods()
            .as(StepVerifier::create)
            .expectNextCount(1)
            .verifyComplete();
    }
}
```

运行，我们可以看到以下结果，说明在创建苹果的时候，调用了库存中的两个方法

```
Create stock for: 苹果
Another listener for Goods: 苹果
```

# 源码在这里

> https://github.com/jiangtj-lab/ex-flux-event
