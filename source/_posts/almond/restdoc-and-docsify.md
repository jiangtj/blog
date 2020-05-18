---
title: Restdoc与Docsify,更简单的生成Api文档
date: 2018-12-10
updated: 2018-12-10
categories: [后端]
tags: [Test]
---
大半年前就写过一篇文章[《测试驱动开发(TDD)的实践》](https://www.dnocm.com/articles/almond/test-driven development/)，关于测试的。时至今日，我仍然坚信测试是软件开发一重要环节，它在绝大多数情况下，保障了系统的质量与稳定性。   

但当时所搭的框架存在一些不足，当然主要是由于Asciidoctor。这是一个足够完善的标记语言，但也足够复杂。然而大多数情况下我们并不需要这些语法，Markdown正好足够。    

事实上，当时我最先尝试的也是Markdown，使用Spring Restdoc中推荐的Slate方案，来解决Markdown无法包含问题。缺点是它运行使用的Ruby，与我所学的完全不同（Java、Js）。但最近看到了另一个文档工具Docsify，它也添加了包含功能，它足够简单，以至于看几遍例子就完全学会，虽然也有缺点，SEO方面，但内部接口文档，你会在乎这个么？下面是一个例子整合Restdoc与Docsify

<!-- more -->

# 创建服务
首先，创建一个简单的Spring Boot服务，以及暴露一个用户接口
```java
@RestController
@SpringBootApplication
public class RestdocDocsifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestdocDocsifyApplication.class, args);
    }

    @GetMapping("/")
    public String index(){
        return "Server is running!";
    }

    @GetMapping("/user")
    public User user(){
        return new User("Jone",1,20);
    }

}
```
# 创建测试用例
这个测试用例是集成测试
```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
public class RestdocDocsifyApplicationTests {

    @Resource
    private WebTestClient webTestClient;

    @Test
    public void contextLoads() {
        this.webTestClient.get().uri("/").accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .isEqualTo("Server is running!");
    }

    @Test
    public void getUser() {
        this.webTestClient.get().uri("/user").accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody();
    }
}
```
# 整合Restdoc
1. 添加自动配置注解`@AutoConfigureRestDocs`
2. 为每个WebTestClient添加文档参数说明`.consumeWith(document())`
整合之后的结果如下

```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@AutoConfigureRestDocs(outputDir = "docs/snippets")
@Import(CustomRestDocsConfiguration.class)
public class RestdocDocsifyApplicationTests {

    @Resource
    private WebTestClient webTestClient;

    @Test
    public void getUser() {
        this.webTestClient.get().uri("/user").accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .consumeWith(document("user",responseFields(
                        fieldWithPath("name").description("The user's name"),
                        fieldWithPath("sex").description("The user's sex"),
                        fieldWithPath("age").description("The user's age"))
                ));
    }
}
```
其中`outputDir`定义输出目录，指向Docsify文档目录，方便部署（注意添加Git忽略配置），`@Import(CustomRestDocsConfiguration.class)`导入自定义配置，目的是修改模板为Markdown，代码如下
```java
@TestConfiguration
public class CustomRestDocsConfiguration implements RestDocsWebTestClientConfigurationCustomizer {
    @Override
    public void customize(WebTestClientRestDocumentationConfigurer configurer) {
        configurer.snippets().withTemplateFormat(TemplateFormats.markdown());
    }
}
```
# 创建Docsify文件
Docsify的一些入门，可以查看[官网](https://docsify.js.org/#/zh-cn/quickstart)，这里已经当你会基本的操作了。首先创建一个`index.html`，您可以使用命令行生成，或者直接Copy下面的代码
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Spring-Cloud Docs</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Description">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/vue.css">
</head>

<body>
<div id="app"></div>
<script>
    window.$docsify = {
        name: 'Restdoc-Docsify Examples',
        repo: 'JiangTJ/restdoc-docsify',
        loadSidebar: true,
        autoHeader: true,
        auto2top: true,
        subMaxLevel: 2
    }
</script>
<script src="//unpkg.com/docsify/lib/docsify.min.js"></script>
<script src="//unpkg.com/docsify/lib/plugins/search.js"></script>
<script src="//unpkg.com/prismjs/components/prism-java.min.js"></script>
<script src="//unpkg.com/prismjs/components/prism-bash.min.js"></script>
<script src="//unpkg.com/prismjs/components/prism-http.min.js"></script>
</body>

</html>
```

你可以调整`window.$docsify`参数，这里将`loadSidebar`置为了`true`，为的是每个需求服务分在不同的文件里    
同样的需要为其添加主页`README.md`和侧边栏`_sidebar.md`  

- README.md
  ```md
  # Welcome Page
  
  ## How to use
  mvn test
  docsify serve docs
  browse `localhost:3000`   
  click sidebar `User Api`
  ```

- _sidebar.md
  ```md
  * [User Api](user.md)
  ```

编写一个用户服务，使用文档嵌入，将代码片段包括进去

- user.md
  ```md
  ### curl-request
  [curl-request](snippets/user/curl-request.md ':include')
  
  ### http-request
  [http-request](snippets/user/http-request.md ':include')
  
  ### http-response
  [http-response](snippets/user/http-response.md ':include')

  ### httpie-request
  [httpie-request](snippets/user/httpie-request.md ':include')
  
  ### request-body
  [request-body](snippets/user/request-body.md ':include')
  
  ### response-body
  [response-body](snippets/user/response-body.md ':include')
  
  ### response-fields
  [response-fields](snippets/user/response-fields.md ':include')
  ```

# 运行
1. 运行maven测试`mvn test`生成代码片段   
2. 执行命令行`docsify serve docs`，浏览器打开`localhost:3000`就可以预览刚才编写的文档了(事实上该命令只是将docs下的文件直接放置在web服务器中，如果使用CI可以很方便的部署该文档服务)

# 不足
Docsify足够简单，Restdoc在测试阶段生成文档的方式既校验了代码，又校验文档，这种方式还有什么不足呢？在以下两方面
- 无法很好的生成pdf文件
- Mock接口

如果你所在的公司非常“传统”，对于doc或者pdf之类的文件很执着，那Asciidoctor更适合您，多学一门语言而已，但Asciidoctor生成的pdf是真的漂亮。另外一个Mock接口，是为了在完成前，前端可以直接调用Mock接口进行调试，这是一个很好的实践，具体如何做到，你可以尝试一下，方式应该是多种多样的

# 参考
- [该文档的例子工程](https://github.com/JiangTJ/restdoc-docsify)
- [Spring Boot文档](https://docs.spring.io/spring-boot/docs/2.1.1.RELEASE/reference/htmlsingle/#boot-features-testing)
- [Spring Restdoc文档](https://docs.spring.io/spring-restdocs/docs/2.0.2.RELEASE/reference/html5/)
- [Docsify文档](https://docsify.js.org/#/)

