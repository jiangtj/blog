---
title: 作为一名Java工程师,如何高效的工作
date: 2017-10-27
categories: [后端]
tags: [高效]
---

之前一段时间，我一直专注于框架的学习。考虑在不同的场景下，应用不同的框架，来提高效率。但我忽略了一个很重要的事实，框架本身就需要我们花时间去了解以及学习。对于一个企业来说，沿用以前的技术，显然是最“快”的。   
而，在一次偶然的情况下，我看到idea的快捷方式，比如对象后面拼`.var`。这样愉快的编程方式，让我眼前一亮，就像第一次使用idea时，不用再`Ctrl+v`保存一样。至于为什么说愉快，我想啰嗦的书写，几乎都会感到痛苦吧。  

<!-- more -->

> 所以，还有什么方法可以做到高效呢    


### 工具：idea

idea或许是最好的java编辑器把。语法的提示完整，许多的快捷操作。以及，第一次用就能感受到的不用保存的酸爽吧（现在用着VS Code写博客，常常忘记保存）。这里详细介绍一下它的快捷操作     

#### 不在需要的 Crtl + V

这真的很好，省了很多的时间，也不用担心代码没保存的情况。但事实上，的确还是有一小部分人（或许刚刚接触JetBrains的产品），还留有及时保存的习惯。

#### .var (T name = expr)

当我们调用一个对象的方法的时候，在提示的方法的列表最下面往往可以看到这些“方法”    

![](https://jiangtj.github.io/assets/img/others/idea1.jpg)  

但我们习惯性的忽略了这些“方法”，毕竟，不是我们定义过的，也不是父类中继承过来的。而且，没尝试过也不知道它的作用。   

而它们，事情上非常好用，拿var来说吧。一般我们定义对象常常直接写`new User()`，而很少有`User user ...`开头写的。写完后，才发现接下来要用到，然后回过头去，补上对象的申明。这样的回头，让你代码过程断断续续的，完成没了一气呵成的爽快。    

如果在idea直接打`.var`，那编辑器将帮你自动回到前面创对象申明。创好后回车确认，idea也很贴心的帮你回到行末，继续接下来的工作。   

也有人会觉得这难懂，其实idea给了足够的提示，比如.var后面分`T name = expr`，其中T表示对象的类型，编辑器会自动去检测，expr（expression）表达式的缩写，代表了当然的这部分代码。   

### 插件：Lombok

要说怎么让java代码更加简洁，或许Lombok是首选的把。只要@Data，不用写getter和setter了。    

*这里需要提醒一下，Lombok需要配合插件，如果在团队中使用，需要与团队成员提前沟通。*    

Lombok中最常用到的应该是@Data和日志的注解@Log、@Slf4j等，这里引用一下之前一篇博客的小例子。    

一个实体类TestEntity.class    

```java
@Data//=@Setter @Getter @ToString @EqualsAndHashCode
//这个@Builder就是用来生成建造者模式的，只需要小小的一个注解，就能实现了
@Builder
//下面两个注解，因为@Builder必须要全属性构造方法，才能使用。
//虽然默认会生成全属性构造方法，但使用@NoArgsConstructor会覆盖掉这个默认，因此需要添加@AllArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
public class TestEntity {
    private String name;
    private Integer age;
}
```

和一个测试用例    

```java
//这个也是Lombok的一个注解
@Slf4j
public class TestEntityTest {
    @Test
    public void test() {
        TestEntity entity = TestEntity.builder()
                .name("MrJ")
                .age(100)
                .build();
        log.error(entity.toString());
    }
}
```

这个例子是讲解@Builder如何简单的创建建造者模式，但并不妨碍介绍其他的注解。除了外还有其他许多注解，这就不多讲了，有兴趣的可以自行搜教程    

### 目录结构

虽然放在最下面，我觉得是最重要的一点，但这个有大量的个人见解。如果看法与我不同，很期待与你讨论。    

废话不多说，上我的一个项目的结构图   

![](https://jiangtj.github.io/assets/img/others/jiegou-1.jpg)

其中有几个文件或文件夹可以忽略，`fegin`和`module-info.java`瞎尝试的（脸红）。这几个文件夹的作用，分别做个介绍吧    

- controller 控制层，一般都是组织http接口的
- service 服务层，业务逻辑一般写在这里
- dao 数据库操作的抽象层，定义了操作接口，他的实现放在了classpath下的mapper中。
- entity 对应数据库中的实体
- dto 数据传输对象，放了一堆的controller或者service中用到的对象
- common 这里比较杂很多的东西都方法这，一般**不常用**到的

#### service

单独介绍它，是因为，曾今有人对此有疑问。为什么要怎么弄？直接写不是更好么？或许你听的糊里糊涂的，没事看一下下面的图，应该能知道

![](https://jiangtj.github.io/assets/img/others/jiegou2.jpg)   

在这次设计中，service使用接口做了抽象，而它的实现放在了impl文件夹下。   

事实上这是非常常见的处理方式，毕竟业务一般都很复杂，如果直接写在类中，对于阅读与维护都很不利的。但这里有两种不同的处理方式，大部分情况下，service与serviceImpl放在同目录下，而我impl放在service之下（其实是参考了一大神的写法，但我很认同这点）。因为，我认为，既然已经抽象出了一层，那么对于其他的层，抽象出来的service是最重要的，而他的实现，是**“不重要”**的。    

#### common

或者这才是我想说的重点吧，先来看看common下有什么把    

![](https://jiangtj.github.io/assets/img/others/jiegou3.jpg)   

很杂，什么都有，同时，这里的文件是我们很少需要去编辑的。比如config，里面放了一些配置文件，如WebConfig（继承spring的WebMvcConfigurerAdapter），基本上在框架成型后，就很好会修改它。放在common里面，那样我留在外部的所有文件或文件夹只有我开发过程中经常用到的了。事实上，刚开始Config文件夹是与service等在同目录下，每次我想编辑Controller，找controller文件夹时，都需要经过config。所以一气之下，把这个文件夹整个拖进了common的。但出乎意料的是，这之后我看界面清爽多了。然后呢，我把utils和aspect也拖了进去（ヾ(ﾟ∀ﾟゞ)）。    

> 于是，对Mr.J最高效的项目结构完成了    

其实，最想表达的一点，把**常用的和重要的**放在外边，其他的丢一个文件夹里不就好了么    

### 结尾 End

这本质可以算作不断的追求极致，所以没有到终点的这一说法，应该还有其他更高效的方式，等我们去挖掘。
