---
title: 测试驱动开发(TDD)的实践
date: 2018-4-15
updated: 2018-4-15
categories: [后端]
tags: [实践,Test]
---

测试驱动开发(TDD)是一种很好的方法论，虽然在国内并不被重视。但仍然想抽时间写一篇关于测试驱动开发的文档。      

OK,最好的描述方式应该分为三部分吧，是什么？为什么？怎么做？那么就从这三部分，分别的描述测试驱动开发方法论。 

<!-- more -->  

# What: TDD 是什么

测试驱动开发，英文全称Test-Driven Development，简称TDD，是一种不同于传统软件开发流程的新型的开发方法。它要求在编写某个功能的代码之前先编写测试代码，然后只编写使测试通过的功能代码，通过测试来推动整个开发的进行。这有助于编写简洁可用和高质量的代码，并加速开发过程。    

Kent Beck先生最早在其极限编程（XP）方法论中，向大家推荐“测试驱动”这一最佳实践，还专门撰写了《测试驱动开发》一书，详细说明如何实现。经过几年的迅猛发展，测试驱动开发已经成长为一门独立的软件开发技术，其名气甚至盖过了极限编程。      

# Why: 为什么需要 TDD

> 再摘个百度百科中的例子    

盖房子的时候，工人师傅砌墙，会先用桩子拉上线，以使砖能够垒的笔直，因为垒砖的时候都是以这根线为基准的。TDD就像这样，先写测试代码，就像工人师傅先用桩子拉上线，然后编码的时候以此为基准，只编写符合这个测试的功能代码。    

而一个新手或菜鸟级的小师傅，却可能不知道拉线，而是直接把砖往上垒，垒了一些之后再看是否笔直，这时候可能会用一根线，量一下砌好的墙是否笔直，如果不直再进行校正，敲敲打打。使用传统的软件开发过程就像这样，我们先编码，编码完成之后才写测试程序，以此检验已写的代码是否正确，如果有错误再一点点修改。    

你是希望先砌墙再拉线，还是希望先拉线再砌墙呢？如果你喜欢前者，那就算了，而如果你喜欢后者，那就转入TDD阵营吧！详细可参阅。   

上述例子中也已经能看出TDD的优点。但还是做个简单总结吧    

它有助于编写简洁可用和高质量的代码，有很高的灵活性和健壮性，能快速响应变化，并加速开发过程    

我们可以这么理解这句话，原本需求->产品设计->产品实现，调整为需求->产品设计->产品开发设计（Test阶段）->产品实现（Develop阶段）    

- 产品开发设计（Test过程）: 由于仅先编写测试用例，相对于直接的开发更加迅速，能快速的响应需求的变化     
- 产品实现（Develop阶段）: 我们仅需确保测试用例都通过，能有效的降低引入bug的可能性。同时测试用例的存在，对于后期维护，提供了强大的支持（回归测试）    

# How: TDD 如何实践

我的实践是 Spring Test + TestNG 集成测试，再配合 Spring Restdocs 文档生成。    

## Spring Test

首先，这不是一个独立的框架，它与Spring框架是绑在一起的，正如开头的第一句话所说，测试驱动在国内不受重视，但在国外恰恰相反。大部分国外的开源框架都集成了测试所需的一些工具类，比如[Spring Boot 单独的一节讲解测试](https://docs.spring.io/spring-boot/docs/2.0.1.RELEASE/reference/htmlsingle/#boot-features-testing)。在这里我们需要用到它的一个TestNG支持的抽象类`AbstractTransactionalTestNGSpringContextTests`，这个类的用于初始化Spring环境以及添加事务支持   

## TestNG

在Java里，最为流行的测试框架应该是JUnit和TestNG，他们的功能也十分相似。在这里，做个简单的比较，和阐述一下采用TestNG的原因    

首先，先说一下JUnit，它是个优秀的单元测试框架，严格的遵守一个实现类一个测试类的方式。事实上，如果对代码质量要求很高，的确需要对每个类都编写测试用例。但例如Spring的代码，分为Dao层，Service层，Controller层，即便只是完成一个小功能，都需要编写多个测试类，来完成测试。这中间会耗费许多的时间，同时对于我们程序猿来说，也是件痛苦的事。而且，一般情况下，并需要如此高的质量。TestNG既包涵了JUnit的单元测试的功能，同时他也可以进行集成测试。我们仅需对功能点（接口）编写相应的集成测试，这能减少大量的代码量。所以，如果能把测试用例的编写变成一般轻松的事，谁不愿这么做呢   

## Spring Restdocs

Spring REST Docs helps you to document RESTful services. It combines hand-written documentation written with Asciidoctor and auto-generated snippets produced with Spring MVC Test. This approach frees you from the limitations of the documentation produced by tools like Swagger. It helps you to produce documentation that is accurate, concise, and well-structured. This documentation then allows your users to get the information they need with a minimum of fuss.     

简单的说，它能使用Asciidoctor组合Spring MVC Test生成的代码片段，编写RESTful的接口文档   

## 环境配置

主要是Maven的配置，因为使用TestNG以及Spring Restdocs，我们需要添加以下依赖    
```xml
		<!-- test -->
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-test</artifactId>
			<scope>test</scope>
		</dependency>
		<!-- option: remove junit -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<artifactId>junit</artifactId>
					<groupId>junit</groupId>
				</exclusion>
			</exclusions>
		</dependency>
		<!-- testng -->
		<dependency>
			<groupId>org.testng</groupId>
			<artifactId>testng</artifactId>
			<version>6.8.13</version>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.assertj</groupId>
			<artifactId>assertj-core</artifactId>
			<scope>test</scope>
		</dependency>
		<!-- restdocs -->
		<dependency>
			<groupId>org.springframework.restdocs</groupId>
			<artifactId>spring-restdocs-mockmvc</artifactId>
			<scope>test</scope>
		</dependency>
```

同时还需要配置Maven插件    
```xml
			<plugin>
				<groupId>org.asciidoctor</groupId>
				<artifactId>asciidoctor-maven-plugin</artifactId>
				<version>1.5.3</version>
				<configuration>
		            <!-- 默认位置在src/main/asciidoc下 -->
					<sourceDocumentName>index.adoc</sourceDocumentName>
					<doctype>book</doctype>
					<attributes>
						<allow-uri-read>true</allow-uri-read>
						<attribute-missing>warn</attribute-missing>
					</attributes>
				</configuration>
				<executions>
					<execution>
						<id>generate-docs</id>
						<phase>test</phase>
						<goals>
							<goal>process-asciidoc</goal>
						</goals>
						<configuration>
							<backend>html5</backend>
							<sourceHighlighter>highlight.js</sourceHighlighter>
							<attributes>
								<toc2 />
								<docinfo>shared-head</docinfo>
							</attributes>
						</configuration>
					</execution>
				</executions>
				<dependencies>
					<dependency>
						<groupId>org.springframework.restdocs</groupId>
						<artifactId>spring-restdocs-asciidoctor</artifactId>
						<version>2.0.0.RELEASE</version>
					</dependency>
				</dependencies>
			</plugin>
```

## 组装

1. 我们需要定义自己的TestNG抽象类，继承`AbstractTransactionalTestNGSpringContextTests`，并配置Spring Restdocs      
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractAssetsTests extends AbstractTransactionalTestNGSpringContextTests {

    private final ManualRestDocumentation restDocumentation = new ManualRestDocumentation("target/generated-snippets");

    @Autowired
    private WebApplicationContext context;

    protected MockMvc mockMvc;

    @BeforeMethod
    public void setUp(Method method) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(this.restDocumentation)).build();
        this.restDocumentation.beforeTest(getClass(), method.getName());
    }

    @AfterMethod
    public void tearDown() {
        this.restDocumentation.afterTest();
    }

}
```

2. 编写测试用例，继承我们的抽象类`AbstractAssetsTests`   
```java
public class UserControllerTest extends AbstractAssetsTests {

    @Resource
    private UserService userService;

    @Test
    @Rollback
    public void add() throws Exception {
        User user = getMockUser();
        super.mockMvc.perform(MockMvcRequestBuilders.post("/user/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(Objects.requireNonNull(JacksonUtils.toJson(user))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andDo(document("user-add"));
    }

    @Test
    @Rollback
    public void delete() throws Exception {
        ResultDto<User> add = userService.add(getMockUser());
        User user = add.getObject();
        super.mockMvc.perform(MockMvcRequestBuilders.delete("/user/delete")
                .param("ids",user.getId()+""))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andDo(document("user-delete"));

    }

    //......

    private User getMockUser() {
        return User.builder()
                .name("test-001")
                .password("123456")
                .pointId(1L)
                .roleId(1L)
                .description("TestNG测试帐号")
                .build();
    }

}
```

3. Asciidoctor拼接代码片段   
```adoc
= 接口文档
Mr.J;
:toc2:
:toc-title: 目录
:doctype: book
:icons: font
:source-highlighter: highlightjs
:docinfo: shared-head


include::readme.adoc[]

include::user/user-list.adoc[]

== 例子

简单的接口文档使用 Spring REST Docs 和 TestNG.

`SampleTestNgApplicationTests` makes a call to a very simple service and produces three
documentation snippets.

用户添加:

include::{snippets}/user-add/curl-request.adoc[]

用户添加响应:

include::{snippets}/user-add/http-response.adoc[]

=== 三级标题

恩恩恩
```

## 运行试试

1. Maven运行测试用例   
![](https://jiangtj.github.io/assets/img/others/testng-fail.png)    
隔得时间有的久（三个月前），加接口变动，其中一个测试用例跑失败了。当然啦，这也展示了Spring Restdocs的另一大特性，对文档的校验，能时刻保证您的文档与接口字段对应，从而减少因文档不准引入错误的可能性    

2. 运行接口文档   
![](https://jiangtj.github.io/assets/img/others/spring-restdocs-test.png)   

## 测试驱动

以上的步骤，我们走完了测试环境的搭建。但测试驱动并不是写完功能代码编写测试用例，而且在开始前（设计阶段），编写测试用例，为后续的开发提供依据，同时接口文档也需要提前生成为前后端分离开发提供助力    

**那，该怎么做呢？**   

这时候，我们就需要模拟一个实现类，大部分情况下是模拟一个Service。这里推荐使用Spring Test的一个工具`ReflectionTestUtils`，注入测试实现类     

1. 先创建service接口的测试实现，例如    
```java
public class UserServiceTestBean implements UserService {

    @Override
    public ResultDto<User> getUserById(long id) {
        ResultDto<User> result = new ResultDto<>(ResultCode.SUCCESS);
        result.setObject(new User());
        return result;
    }

    @Override
    public ResultDto<User> add(User t) {
        ResultDto<User> result = new ResultDto<>(ResultCode.SUCCESS);
        result.setObject(t);
        return result;
    }

    //......
}
```

2. 在调用之前注入测试的模拟对象    
```java
    @Test
    @Rollback
    public void add() throws Exception {

        //为userController注入userService对象
        ReflectionTestUtils.setField(userController, "userService", new UserServiceTestBean());

        User user = getMockUser();
        super.mockMvc.perform(MockMvcRequestBuilders.post("/user/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(Objects.requireNonNull(JacksonUtils.toJson(user))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andDo(document("user-add"));
    }
```

这样我们完成了在实现之前，优先编写完测试用例。当然当service实现后，相应的mock代码都需要注释掉。使用Mockito模拟service对象也是行的，但在尝试后，不如直接编写测试对象来的高效。    



# 结尾 
上面代码开源在GitHub上，有兴趣的可以去看看  
<https://github.com/JiangTJ/enterpriseAssetManagement/tree/testng%26spring-rest-docs>   
缺少mock相关的代码，毕竟当时写测试用例时，service已经全部实现了，当然，您可以fork后自己尝试一下mock一些对象    

