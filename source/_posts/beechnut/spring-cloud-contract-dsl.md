---
title: Spring Cloud Contract DSL
categories: [后端]
tags: [微服务,Spring Cloud]
date: 2019-04-28 21:29:12
updated: 2019-04-28 21:29:12
---

这是一篇介绍Spring Cloud Contract语言定义的文章，也就是该怎么写契约内容。如果您对Spring Cloud Contract不是很了解，不知如何更好的实践的话，可以先看下我之前的文章[《Spring Cloud Contract 契约测试》](/articles/beechnut/spring-cloud-contract)

在这个框架中，我们既可以采用Groovy，也可以yaml。但由于本身属于Java的框架，在支持上Groovy要更好些，推荐且这里只介绍Groovy（事实上，我对Spring官方同时支持两种定义方式并不理解，专注一种或许会更好啊）。

> 该文章基于Spring Cloud Contract 2.1.0.GA

<!-- more -->

# 顶级元素
首先，使用Groovy做契约脚本，必须使用`org.springframework.cloud.spec.Contract.make`，当然，也可以选择`import`，如下
```groovy
package contracts

import org.springframework.cloud.contract.spec.Contract

//定义单个契约
Contract.make {}

//如果需要有多个存在一个文件中
[
    Contract.make {},
    Contract.make {}
]
```

这里将make{}中直接使用的方法或者属性成为顶级元素。在脚本中，不会特别区分方法还是属性的，所以用元素来代替。

在Spring Cloud Contract中有以下几种顶级元素
- name: 名称
- description: 描述
- ignored: 忽略
- priority: 优先级
- HTTP元素

## Name
在定义一个文件中多个契约时，默认会使用`-[index]`后缀来区分不同的契约，这样的测试用例可读性较差（不清楚哪个是做什么的）。当然，单个可能也会遇到文件名称无法表达的情况。所以我们需要通过`name()`来修改生成的测试用例名称，当然它也会同时修改`WireMock stub`（指契约mock时，所使用的json文件）名称。

例如：
```groovy
Contract.make {
    name('第一个契约呀')
}
```

结果：测试用例
```java
@Test
public void validate_第一个契约呀() throws Exception {}
```

结果：WireMock stub
```
第一个契约呀.json
```

> 你们不要用中文哦~

## Description

描述用途，或者在BDD中所需要描述的角色、想要、目的、场景、限制等等，可以写在这里。它不会生成到单元测试或者存根中，仅仅做记录而已。但，请看下面的例子：
```groovy
Contract.make {
    description("""
        [运营]需要[去掉操作A]，目的是[减少流程与人工成本]，存在的问题[减少A操作，会使部分数据未记录（运营人员已知晓（见邮件‘邮件主题’））]
    """)
}
```

然而某天，由于缺少A操作的记录，导致部分问题无法解决，他们会“趾高气扬”的责备，这程序设计的怎么怎么烂。但如果有这段描述，你就淡定了，喝杯咖啡，查下邮件，转发某某，抄送领导A、领导B。。。（这样的事在业务驱动的公司十分常见）

## Ignored
如果你不希望生成某个契约，你可以在插件`<configuration><includedFiles>`中忽略或者在契约内添加`ignored()`
```groovy
Contract.make {
    ignored()
}
```

## Priority
有时我们会定义相似的契约，比如当调用接口`/user/{id}`，id为10时失败，其它都成功。那么我们需要为id为10设置更高的优先级
```groovy
//url与urlPath稍后讲，一个指定值，一个进行正则匹配
Contract.make {
    request {
        url "/user/10"
        //...
    }
    priority(1)
}
Contract.make {
    request {
        urlPath($(c(regex('^/user/.+')),p(1)))
        //...
    }
    priority(2)
}
```

## HTTP元素

除了上面的，还包含HTTP元素，即request、response。这两个元素是契约最重要的组成部分，必不可少。在官方文档中priority算在了这里，但我更倾向于分开（我们常说的HTTP请求有优先级？）

http是十分重要的，所以放在单独的两章中

# Request

一个HTTP Request一般情况由method、url、header、requestBody这几部分组成，HTTP协议中method、url是强制的，同样的在契约里也属于必须提供的内容

## Method
在Request设置Method属性
```groovy
Contract.make {
    request {
        method 'PUT'
    }
}
```

## Url

最简单设置url的方式是，直接设置url属性
```groovy
Contract.make {
    request {
        url '/user/10'
    }
}
```

或者你可以使用urlPath，一个Path组件来定义url
```groovy
Contract.make {
    request {
        urlPath('/users') {
            queryParameters {
                parameter 'limit': 100
                parameter 'filter': equalTo("email")
                parameter 'gender': value(consumer(containing("[mf]")), producer('mf'))
                parameter 'offset': value(consumer(matching("[0-9]+")), producer(123))
                parameter 'loginStartsWith': value(consumer(notMatching(".{0,2}")), producer(3))
                parameter 'uuid': $(anyUuid())
            }
        }
    }
}
```

urlPath分为两部分，本身的路径以及参数。路径可以是正则（前面的例子）也可以是想url里那样的普通字符串。

另一部分`queryParameters`是`？`后面的参数，其中简单的，如`'limit': 100`与`'filter': equalTo("email")`是一样的，只是写法不同，表示值相等的情况。另外就涉及的动态参数。

### 动态参数

除了`equalTo`我们还看到了`value()``$()`，这是Spring Cloud Contract另一大特性，动态参数。可以试想一下如果我们调用的参数是指定，那么会怎样呢？

首先，我们无法保证调用方是一个还是多个，假如一个业务需要模拟多用户调用，那么我们需要mock不同参数的数据。在指定参数的情况下意味着我们需要多份契约，以便消费方调用。这显然不合理，多份契约是冗余的，没有启到任何作用，而且每次的修改，需要同时修改多个地方。

所以，我们应当接受任意我们所能接受的数据，并返回预期结果，以方便消费者也可以根据其业务定制他的参数。

在动态参数中，有些写法不同，但实际是一样的，比如：
```js
value() = $()
consumer(...) = c(...) = stub(...) = client(...)
producer(...) = p(...) = test(...) = server(...)
```

在动态属性中，基本的结构是`$(consumer(...),producer(...))`。consumer定义接受的参数，或者消费方的定义。producer表示验证的数据，提供方验证用的数据，也就是单元测试中用到的数据

consumer一般都多种匹配方式，`containing`包含，`matching`正则匹配，`notMatching`正则不匹配。

其中正则匹配，Spring Cloud Contract内置了一些正则表达式，可以直接使用
```groovy
protected static final Pattern TRUE_OR_FALSE = Pattern.compile(/(true|false)/)
protected static final Pattern ALPHA_NUMERIC = Pattern.compile('[a-zA-Z0-9]+')
protected static final Pattern ONLY_ALPHA_UNICODE = Pattern.compile(/[\p{L}]*/)
protected static final Pattern NUMBER = Pattern.compile('-?(\\d*\\.\\d+|\\d+)')
protected static final Pattern INTEGER = Pattern.compile('-?(\\d+)')
protected static final Pattern POSITIVE_INT = Pattern.compile('([1-9]\\d*)')
protected static final Pattern DOUBLE = Pattern.compile('-?(\\d*\\.\\d+)')
protected static final Pattern HEX = Pattern.compile('[a-fA-F0-9]+')
protected static final Pattern IP_ADDRESS = Pattern.
		compile('([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])')
protected static final Pattern HOSTNAME_PATTERN = Pattern.
		compile('((http[s]?|ftp):/)/?([^:/\\s]+)(:[0-9]{1,5})?')
protected static final Pattern EMAIL = Pattern.
		compile('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}')
protected static final Pattern URL = UrlHelper.URL
protected static final Pattern HTTPS_URL = UrlHelper.HTTPS_URL
protected static final Pattern UUID = Pattern.
		compile('[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}')
protected static final Pattern ANY_DATE = Pattern.
		compile('(\\d\\d\\d\\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])')
protected static final Pattern ANY_DATE_TIME = Pattern.
		compile('([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])')
protected static final Pattern ANY_TIME = Pattern.
		compile('(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])')
protected static final Pattern NON_EMPTY = Pattern.compile(/[\S\s]+/)
protected static final Pattern NON_BLANK = Pattern.compile(/^\s*\S[\S\s]*/)
protected static final Pattern ISO8601_WITH_OFFSET = Pattern.
		compile(/([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.\d{3})?(Z|[+-][01]\d:[0-5]\d)/)

protected static Pattern anyOf(String... values) {
	return Pattern.compile(values.collect({ "^$it\$" }).join("|"))
}

RegexProperty onlyAlphaUnicode() {
	return new RegexProperty(ONLY_ALPHA_UNICODE).asString()
}

RegexProperty alphaNumeric() {
	return new RegexProperty(ALPHA_NUMERIC).asString()
}

RegexProperty number() {
	return new RegexProperty(NUMBER).asDouble()
}

RegexProperty positiveInt() {
	return new RegexProperty(POSITIVE_INT).asInteger()
}

RegexProperty anyBoolean() {
	return new RegexProperty(TRUE_OR_FALSE).asBooleanType()
}

RegexProperty anInteger() {
	return new RegexProperty(INTEGER).asInteger()
}

RegexProperty aDouble() {
	return new RegexProperty(DOUBLE).asDouble()
}

RegexProperty ipAddress() {
	return new RegexProperty(IP_ADDRESS).asString()
}

RegexProperty hostname() {
	return new RegexProperty(HOSTNAME_PATTERN).asString()
}

RegexProperty email() {
	return new RegexProperty(EMAIL).asString()
}

RegexProperty url() {
	return new RegexProperty(URL).asString()
}

RegexProperty httpsUrl() {
	return new RegexProperty(HTTPS_URL).asString()
}

RegexProperty uuid() {
	return new RegexProperty(UUID).asString()
}

RegexProperty isoDate() {
	return new RegexProperty(ANY_DATE).asString()
}

RegexProperty isoDateTime() {
	return new RegexProperty(ANY_DATE_TIME).asString()
}

RegexProperty isoTime() {
	return new RegexProperty(ANY_TIME).asString()
}

RegexProperty iso8601WithOffset() {
	return new RegexProperty(ISO8601_WITH_OFFSET).asString()
}

RegexProperty nonEmpty() {
	return new RegexProperty(NON_EMPTY).asString()
}

RegexProperty nonBlank() {
	return new RegexProperty(NON_BLANK).asString()
}
```

还有，如果你觉得`value(consumer(number()), producer("1"))`有点麻烦的话，这个框架还提供了一种简便写法，`anyNumber()`。任何一个`any*`都代表一个正则，如果使用这个简便写法，在producer不提供的情况下，会随机生成一个符合的参数，用于接口测试。
```js
value(anyNumber()) = value(consumer(number()), producer("一个随机的数字"))
value(anyNumber(), producer("1")) = value(consumer(number()), producer("1"))
```

## Header

用于匹配Request头部是否符合规范
```groovy
Contract.make {
    request {
        headers {
            header('contentType': 'application/json')
            //在groovy中可以使用内置的函数代替如下面
            //contentType(applicationJsonUtf8())
        }
    }
}
```

## Body
当method为PUT或者POST时，依据http协议，我们可以将数据放在body中。
```groovy
Contract.make {
    request {
        headers {
            contentType(applicationJson())
        }
        body([
                name: value(anyNonEmptyString(), producer("从入门到弃坑")),
                price: value(anyNumber(), producer("1"))
        ])
    }
}
```

根据contentType不同，它会自动转换至Json或者FormParam。body的值也能设置动态参数，参考上文。除此之外，body还支持bodyMatchers，我们可以提供body样例，在外部提供匹配规则
```groovy
Contract.make {
    request {
        headers {
            contentType(applicationJson())
        }
        body ([
            "name":"YaYaYa"
        ])
        bodyMatchers {
            jsonPath('$.name', byRegex(nonBlank()))
        }
    }
}
```

通过`$.[path]`获取json位置，通过`by*`定义匹配规则

> 但需要特别注意：动态参数目前还不支持FormParam。如果存在FormParam，改用QueryParam传参（反正一样的）。    
参考：[spring-cloud-contract#112](https://github.com/spring-cloud/spring-cloud-contract/issues/112)与[wiremock#383](https://github.com/tomakehurst/wiremock/issues/383)



# Response

response与request存在一些共通点，比如`header` `body`等，这些写法上与Request中是一致的，可以参考上文

## Status

`status code`是响应独有的，而且是必须的一项
```groovy
Contract.make {
    response {
        status OK()
    }
}
```

## FromReques

某些情况下，我们可能需要返回request中的值。比如添加一个用户，成功时，我们应当返回该用户在后端实际存储的信息给前端。所以我们需要调用`fromReques()`获取数据
```groovy
Contract.make {
    response {
        body([
                "gender": fromRequest().query('gender'),
                "name": fromRequest().body('$.name')
        ])
    }
}
```
`fromRequest()`有以下一些方法：
- fromRequest().url(): 返回URL与query parameters.
- fromRequest().query(String key): 返回第一个匹配到的query parameter值.
- fromRequest().query(String key, int index): 返回第[index]个匹配到的query parameter值.
- fromRequest().path(): 返回完整的url路径.
- fromRequest().path(int index): 返回第[index]个url路径元素.
- fromRequest().header(String key):返回第一个匹配到的header值.
- fromRequest().header(String key, int index): 返回第[index]个匹配到的header值.
- fromRequest().body(): 返回完整的body.
- fromRequest().body(String jsonPath): 返回body中指定JSON路径的元素.

## Body

在Response中，我们可以使用其他的写法给body赋值，比如`"""`添加字符串
```groovy
Contract.make {
    response {
        body """{"name":"YaYaYa"}"""
    }
}
```

又或者我们可以将它放在外部（如果样例非常大时，是个不错的方案）
```groovy
Contract.make {
    response {
        body (file('文件的相对路径，例如xxxx.json'))
    }
}
```

> 这块内容在Request中也是可用的，但如果与动态属性结合会出错，可能是[issue](https://github.com/spring-cloud/spring-cloud-contract/issues/1065)吧。所以尽量不要在Request中使用这块内容。

# 一个比较完整示例
在最后，给个比较完整的例子，将就着看吧~~
```groovy
package contracts

import org.springframework.cloud.contract.spec.Contract

Contract.make {
    priority(1)
    name('第一个契约呀')
    description("""
        [运营]需要[去掉操作A]，目的是[减少流程与人工成本]，存在的问题[减少A操作，会使部分数据未记录（运营人员已知晓（见邮件‘邮件主题’））]
    """)
    request {
        method 'PUT'
        urlPath($(c(regex('^/user/.+')),p('/user/1'))) {
            queryParameters {
                parameter 'limit': 100
                parameter 'filter': equalTo("email")
                parameter 'gender': value(consumer(containing("[mf]")), producer('mf'))
                parameter 'offset': value(consumer(matching("[0-9]+")), producer(123))
                parameter 'loginStartsWith': value(consumer(notMatching(".{0,2}")), producer(3))
                parameter 'uuid': $(anyUuid())
            }
        }
        headers {
            contentType(applicationJson())
        }
        body([
                name: value(anyNonEmptyString(), producer("从入门到弃坑")),
                price: value(anyNumber(), producer("1"))
        ])
    }
    response {
        status OK()
        body([
                "gender": fromRequest().query('gender'),
                "name": fromRequest().body('$.name')
        ])
        headers {
            contentType(applicationJsonUtf8())
        }
    }
}
```

