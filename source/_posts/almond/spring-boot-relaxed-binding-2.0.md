---
title: Spring Boot Relaxed Binding 2.0
date: 2018-07-12
updated: 2018-07-12
categories: [后端]
tags: [Spring Boot]
---

Spring Boot 中的配置绑定一直是其最主要的特性。而在Spring Boot 2.0中，该绑定方式做了大量的修改，并且借机制定一些新的规范，以减少过于宽松的绑定规则导致的一些问题

> 您也可以通过官方的[Relaxed-Binding-2.0 wiki](https://github.com/spring-projects/spring-boot/wiki/Relaxed-Binding-2.0)了解详细

<!-- more -->

# 设置配置属性

## 简单的类型

配置文件中的简单类型，都会被移除特殊字符并转为小写后，进行绑定。例如下面的几个配置都等价于`spring.jpa.databaseplatform=mysql`:
```properties 
spring.jpa.database-platform=mysql
spring.jpa.databasePlatform=mysql
spring.JPA.database_platform=mysql
```
> 当然，推荐的是kebab-case命名，也是上面例子中的`spring.jpa.database-platform=mysql`

## List类型
List类型的属性，在配置文件中需要使用`[ ]`标记符:
```properties
spring.my-example.url[0]=http://example.com
spring.my-example.url[1]=http://spring.io
```
或者yml的标准写法
```yml
spring:
  my-example:
    url:
      - http://example.com
      - http://spring.io
```
同时，还支持使用逗号分割成数组，例如：
```properties
spring.my-example.urls=http://example.com,http://spring.io
```
注意：在properties，如果遗漏中间的索引，会导致无法绑定异常，下面是不被允许的：
```properties
foo[0] = a
foo[2] = b
```

## Map 类型
Map类型标准格式很简单`my-example.key=value`，yml类似的，但当遇到特殊字符时，就需要特别处理，但官方文档上讲的，不是很清楚，所以写了几个例子做实验   

```properties
jwt.test.xx=1
jwt.test.xx-xx=2
jwt.test.XX-xx=3
jwt.test.[ww-ww]=4
jwt.test.'[uuu/w1]'=5
jwt.test.[uuu/w2]=6
```

```yml
jwt:
  ymltest:
    foo: 1
    ppp-vvv: 2
    [scfds-tgro]: 3
    '[csf-te]': 4
    '[csf/e]': 5
```

结果如下图所示：   
![](/images/md/others/spring-test-map.png)    


## 环境变量
在环境变量中，使用`_`代替`.`或者`[]`，如果`_`包围的是一数字，就替换为`[]`，其余情况为`.`，例如：   
```
MY_FOO_1_ = my.foo[1]
MY_FOO_1_BAR = my.foo[1].bar
MY_FOO_1_2_ = my.foo[1][2]
```

# 读取配置属性

如果，你需要从环境中读出属性值到你的app中，你需要使用与配置文件一样规则的名称
- 相同的名称
- 必须是 (a-z,0-9)字母
- 必须是 小写
- 唯一允许的特殊字符是`[]`，用于表示list的索引
- 用连接符`-`分割单词
- 不能以数字开头   

下面是一个从配置文件中读出属性的例子：
```java
this.environment.containsProperty("spring.jpa.database-platform")
```
> @Value 也需要遵守一样的规则



