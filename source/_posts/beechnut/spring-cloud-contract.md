---
title: Spring Cloud Contract 契约测试
date: 2019-03-28 23:18:51
updated: 2019-03-28 23:18:51
tags:
  - 微服务
  - Spring Cloud
categories: [后端]
---

Spring Cloud Contract是契约测试的一个实现，最早看到契约测试还是在《微服务设计》书中，不过那时候绝对想不到真的会接触它。

# 什么是契约测试？

首先，先谈谈思想，什么是契约测试？事实上在很多地方都称为消费者驱动契约(CDC) ，似乎都喜欢加驱动，比如TDD测试驱动等，但我不喜欢在这里加，契约是由提供者与消费者共同制定的，不可能由一方驱动。而契约测试也将同时作用于两方：
- 验证提供方是否履约
- 验证消费方在提供方履约下是否正常工作

由于一般都只考虑提供方的履约验证，所以误解为消费者驱动。事实呢，提供方与消费方是唯一的么？你的契约不会变么？一旦发生改变，那么契约测试也会对消费方进行验证。

<!-- more -->

# 为什么要使用
随着服务拆分，服务间的调用变得更加频繁。原本的测试方案（单元测试与集成测试）变得力不从心

单元测试，我们会mock服务间的调用，确保我们对很小的原本测试。但是，一旦提供方提供的服务发生改变，这不会及时的响应在单元测试中，这种疏漏会导致单元测试失效。

集成测试，每次我们都需要运行多个服务，以配合完成。其中涉及到服务的配置等等各种问题。

这就好比是场舞台戏，如果每个人都练自己的，那么很可能配合失败。如果一直一起排练，又很占时间。所以需要一份实时都是最新的剧本，每个人都依据它，练习自己的部分。

# 实现
Spring Cloud Contract 提供不错的实现，它分为验证服务（Verifier）和对契约内容Mock服务（Stub Runner）两部分。

## Verifier
通过groovy脚本或者yaml定义接口，由Spring Cloud Contract帮助我们生成测试用例并验证。

**Step 1：环境配置**

需要引入依赖
```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-contract-verifier</artifactId>
            <scope>test</scope>
        </dependency>
        <plugins>
            <plugin>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-contract-maven-plugin</artifactId>
                <extensions>true</extensions>
                <configuration>
                    <baseClassMappings>
                        <baseClassMapping>
                            <contractPackageRegex>.*</contractPackageRegex>
                            <baseClassFQN>com.jtj.cloud.springcontractexample.AbstractDnocmTest</baseClassFQN>
                        </baseClassMapping>
                    </baseClassMappings>
                </configuration>
            </plugin>
        </plugins>
```

其中插件的baseClassFQN配置是，为了让生成的类继承指定类。

需要配置web容器

```java
@RunWith(SpringRunner.class)
@SpringBootTest(
        classes = SpringContractExampleApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
public abstract class AbstractDnocmTest {

    @Autowired
    private WebApplicationContext context;

    @Before
    public void setup(){
        RestAssuredMockMvc.webAppContextSetup(context);
    }

}
```

注意：webflux没有WebApplicationContext，所以目前只能配Controller

**Step 2：编写契约，可以使用groovy，也可以yaml**

```groovy
package contracts

import org.springframework.cloud.contract.spec.Contract

Contract.make {
  request {
    method 'GET'
    urlPath('/groovy') {
      queryParameters {
        parameter "name": value(consumer(regex(nonEmpty())), producer("从入门到弃坑"))
      }
    }
  }
  response {
    status OK()
    body([
            "name": fromRequest().query("name"),
            "price": 1000
    ])
    headers {
      contentType('application/json;charset=UTF-8')
    }
  }
}
```

```yml
request:
  method: GET
  url: /yaml
  queryParameters:
    name: "从入库到精通"
    price: 666
  matchers:
    url:
    queryParameters:
      - {key: name, type: matching, value: "[\\S\\s]+"}
      - {key: price, type: matching, value: '^[0-9]{1,}$'}
response:
  status: 200
  body:
    name: "{{{ request.query.name.[0] }}}"
    price: "{{{ request.query.price.[0] }}}"
  headers:
    Content-Type: application/json;charset=UTF-8
```

注意：matchers的queryParameters部分貌似没有效果（按照文档，照理说没问题的唉），yaml可读性较强，但相对来说自定义较差，如果可能尽可能选择groovy

**Step 3：运行**

1. 使用命令`mvn spring-cloud-contract:generateTests`生成测试用例（在target\generated-test-sources\contracts目录下），并执行单条测试
2. 运行`mvn test`会生成并执行所有测试用例

**Step 4：发布**

时效性对于契约来说十分重要，若无法保证，那单元测试中的问题就等于没解决，所以需要及时的发布生成的-stubs jar包

1. 配置nexus oss，并发布至上面，与一般的上传一致`mvn deploy`，在例子，我使用的是[jfrog bintray](https://bintray.com/jiangtj/maven)发布
2. 如果没有二进制存储库，可以选择Git进行发布
3. 还可以通过Pack，但是，在pack上需要先由前端定义好契约

三个方案各有优缺点：

第一个方案，利用maven来处理是非常合理的，maven本身就是用于二进制文件管理，但如果你无法做到独立升级部署（多个微服务一同修改），那么你可能需要依赖于SNAPSHOT jar，不稳定的版本需要你多次上传，而且maven的快照机制也造成每次都需要检测获取最新版本

第二个方案，对于契约的存储独立存放在git仓库，它的工作原理是clone整个存储库至本地，解析版本以及一些其他的定义，获取契约数据。问题在于clone，本身契约内容是不多的，也就是clone并不会浪费太多时间。但假如多年后呢，如果契约定义不规范频繁改动的情况出现（在企业内，这是很常见的现象），可能造成存储库变得庞大

第三个方案，这是有别于前两个，由消费方定义契约。所以使用场景也更加明确，那就是前端人员充足时。Pact提供了图形化的界面展示契约的验证情况，这是挺好的特性。但是对于后端微服务来说，提供契约需要通过其它方式（未很好的集成），这无疑造成了学习成本增加

## Stub Runner
由于服务提供方对契约是校验的，所以我们可以认为这个mock数据是基本准确的。mock方式有多种

方案一：下载提供方源码，编译并运行`mvn spring-cloud-contract:convert && mvn spring-cloud-contract:run`

方案二：在单元测试中使用，可以配合spring cloud替换一些注册中心的服务，在运行时，不再需要启动多个外部服务

方案三：独立部署契约进行mock，一个很好的前后端分离方案是，前端依据契约mock数据开发，后端依据契约校验提供数据

方案四：使用spring cloud cli运行，
安装spring boot cli[文档](https://docs.spring.io/spring-boot/docs/2.1.3.RELEASE/reference/htmlsingle/#getting-started-installing-the-cli)，
安装spring cloud cli（待再次实践 按文档教程操作失败路过）

### 单元测试

需要的依赖
```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-contract-stub-runner</artifactId>
            <scope>test</scope>
        </dependency>
```

需要添加自动配置注解
```
@AutoConfigureStubRunner
```

没然后了，接下来都是些契约配置
```yml
# 关闭为了能替换ribbon服务
eureka:
  client:
    enabled: false
stubrunner:
  ids:
    # - [groupId]:artifactId:[version]:[classify]:[port]
    - com.jtj.cloud:spring-contract-example:1.0.0
  ids-to-service-ids:
    # 映射服务
    spring-contract-example: none-service
  # 该模式下会从远程maven仓库缓存到本地
  stubs-mode: local
```

### 独立部署

首先下载`stub-runner.jar` 
```bash
wget -O stub-runner.jar 'https://search.maven.org/remotecontent?filepath=org/springframework/cloud/spring-cloud-contract-stub-runner-boot/2.1.1.RELEASE/spring-cloud-contract-stub-runner-boot-2.1.1.RELEASE.jar'
```

在同路径创建配置文件`application.yml`，并添加stubrunner的配置，如下
```yml
stubrunner:
  ids:
    # - [groupId]:artifactId:[version]:[classify]:[port]
    # 指定运行在8081端口
    - com.jtj.cloud:spring-contract-example:1.0.0:+:8081
  # 该模式下会从远程maven仓库缓存到本地
  stubs-mode: local
```

通过`java -jar stub-runner.jar`运行。即可访问`com.jtj.cloud:spring-contract-example`的mock数据啦！

# 参考
- [上面所提到的例子工程-mockmvc](https://github.com/JiangTJ/spring-contract-example)
- [上面所提到的例子工程-webflux](https://github.com/JiangTJ/spring-contract-example/tree/webflux)
- [spring-cloud-contract doc](https://cloud.spring.io/spring-cloud-static/spring-cloud-contract/2.1.0.RELEASE/single/spring-cloud-contract.html)

