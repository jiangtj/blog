---
title: Shiro拦截器与过滤器
date: 2017-8-11
updated: 2017-8-11
categories: [后端]
tags: [Shiro]
---

> 这篇是对 [开涛的《跟我学shiro》](http://www.iteye.com/blogs/subjects/shiro) 的部分章节补充，更详细的探讨shiro的过滤器和拦截器

### 拦截器与过滤器定义
- 过滤器是一个程序，它先于与之相关的servlet或JSP页面运行在服务器上。它依赖于servlet容器。
- 拦截器，在AOP（Aspect-Oriented Programming）中用于在某个方法或字段被访问之前，进行拦截然后在之前或之后加入某些操作。拦截是AOP的一种实现策略。

在shiro中存在下图关系  
![shiro](https://jiangtj.github.io/assets/img/others/shiro%E8%BF%87%E6%BB%A4%E5%99%A8%E4%B8%8E%E6%8B%A6%E6%88%AA%E5%99%A8.PNG)

<!-- more -->

### 过滤器
在开涛博客中 [第八章 拦截器机制——《跟我学Shiro》](http://jinnianshilongnian.iteye.com/blog/2025656) 这里的拦截器主要为过滤器，依赖于servlet，并存在shiro-web包中。开涛讲的很完整，没必要继续讲解，这块不懂得，先点进去了解。

### 拦截器
那么shiro的拦截器又在哪里，怎么调用的呢？

其实，shiro对使用注解方式，进行权限控制的过程是通过拦截器来实现的。接下以spring中集成shiro注解为例，讲解shiro的实现过程。

#### step1: spring配置shiro 注解提供类
```java
    @Bean
    public AuthorizationAttributeSourceAdvisor getAuthorizationAttributeSourceAdvisor(SecurityManager securityManager){
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }
```
这里，需要为spring提供AuthorizationAttributeSourceAdvisor的实例，同时，将shiro 安全管理器赋值给它
#### step2: AuthorizationAttributeSourceAdvisor的实现
先看源码
```java
public class AuthorizationAttributeSourceAdvisor extends StaticMethodMatcherPointcutAdvisor {

    ... //省略了部分

    protected SecurityManager securityManager = null;

    public AuthorizationAttributeSourceAdvisor() {
        this.setAdvice(new AopAllianceAnnotationsAuthorizingMethodInterceptor());
    }

    public SecurityManager getSecurityManager() {
        return this.securityManager;
    }

    public void setSecurityManager(SecurityManager securityManager) {
        this.securityManager = securityManager;
    }

    ... //省略了部分
}
```
`StaticMethodMatcherPointcutAdvisor`的构造函数中提供`AopAllianceAnnotationsAuthorizingMethodInterceptor`来为其提供注解拦截器。
#### step3: AopAllianceAnnotationsAuthorizingMethodInterceptor
```java

public class AopAllianceAnnotationsAuthorizingMethodInterceptor extends AnnotationsAuthorizingMethodInterceptor implements MethodInterceptor {
    public AopAllianceAnnotationsAuthorizingMethodInterceptor() {
        List<AuthorizingAnnotationMethodInterceptor> interceptors = new ArrayList(5);
        AnnotationResolver resolver = new SpringAnnotationResolver();
        interceptors.add(new RoleAnnotationMethodInterceptor(resolver));
        interceptors.add(new PermissionAnnotationMethodInterceptor(resolver));
        interceptors.add(new AuthenticatedAnnotationMethodInterceptor(resolver));
        interceptors.add(new UserAnnotationMethodInterceptor(resolver));
        interceptors.add(new GuestAnnotationMethodInterceptor(resolver));
        this.setMethodInterceptors(interceptors);
    }

    ... //省略了部分

}
```
这一步定了注解获取类`SpringAnnotationResolver`和一系列默认的注解拦截器，如果不使用`SpringAnnotationResolver`，shiro会调用自身的`DefaultAnnotationResolver`,初步看了一下，这两类基本差不多，都是获取注解用的。  
默认的注解拦截器有以下几种：
- RoleAnnotationMethodInterceptor 角色注解拦截器，对应`@RequiresRoles`，判断用户是否拥有角色，下面的权限同理
- PermissionAnnotationMethodInterceptor 权限注解拦截器，对应`@RequiresPermissions`
- AuthenticatedAnnotationMethodInterceptor 授权注解拦截器，对应`@RequiresAuthentication`，判断用户是否已被授权
- UserAnnotationMethodInterceptor 用户注解拦截器，对应`@RequiresUser`，检查用户是否通过记住密码的方式登陆，该注解必须进行登陆操作才能通过
- GuestAnnotationMethodInterceptor 访客注解拦截器，对应`@RequiresGuest`，比较少见的注解，表示未登录用户访问的接口。

#### step4: AuthorizingAnnotationMethodInterceptor
所有的默认拦截器都继承`AuthorizingAnnotationMethodInterceptor`，我们以权限拦截器为例。
```java
public class PermissionAnnotationMethodInterceptor extends AuthorizingAnnotationMethodInterceptor {
    public PermissionAnnotationMethodInterceptor() {
        super(new PermissionAnnotationHandler());
    }

    public PermissionAnnotationMethodInterceptor(AnnotationResolver resolver) {
        super(new PermissionAnnotationHandler(), resolver);
    }
}
```
这里构造函数内提供了`PermissionAnnotationHandler`权限注解的处理类，提供权限判断。到这里一切都清晰了，需要自定义注解一个一个自定义下来，并提供一个新的继承自`AuthorizingAnnotationMethodInterceptor`的类。需要重写默认拦截器，需要覆盖对应的处理类。

### 后记
在一个项目中，我需要重新写权限的判断。开始，我重写了`PermissionsAuthorizationFilter`然而未进该类。不得已，盯着注解一步步走下去。原来shiro内部是这样的，为此，我总算是下定决心学spring security了。