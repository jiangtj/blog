---
title: Gradle 初探
categories: [后端]
tags: [Java, Gradle]
date: 2020-06-17 09:46:00
updated: 2020-06-17 09:46:00
description: 跟我一起，学透它~~~
---

第一次接触 Gradle 是在数年前做android开发的时候，然而后来我的工作都是 Maven 做web开发，所以 Gradle 也就忘得差不多了（其实本来就没学多少）

我相信每个看到这篇文章的人，都是用过 Maven 的， 想学习 Gradle，但在开始前，我们应该弄清楚为什么要学它，它能带来怎样的益处（相对于 Maven）？

# Why

如果你问 Gradle 优于 Maven 么？ 答案必定是不一定

在 Maven 中有完善的依赖管理以及成熟的构建流程，在绝大多数的项目中都能很好的运行。但也是那一套流程，使的 Maven 十分死板。而且 Maven 是只属于 Java 的项目构建工具

在 Gradle 中就灵活的多，你可以随意的定义流程，但一个大型的项目规范是十分重要的，即便是构建流程，也要有规范，也是要统一的，试问假如我要构建一个普通的Web应用，自己定的构建流程又怎么能比过这么长时间积累下来的 Maven 的流程的？ 但我的项目是个缝合怪呢，有java有node，那么 Gradle 就能同时组织它们。 Gradle 是 Java 环境下的构建工具， 它不是 Java 项目构建工具， 就如 node 里的 Gulp

<!-- more -->

# 创建 Basic 项目

Gradle 是通用的构建工具，所以没必要从 Java Web 项目学起，相反，我们可以先创一个空的项目（运行`gradle init`命令可以快速创建）

```
PS C:\Users\MrTT\Desktop\2513\g1> gradle init
Select type of project to generate:
  1: basic
  2: application
  3: library
  4: Gradle plugin
Enter selection (default: basic) [1..4] 1

Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Groovy) [1..2] 2

Project name (default: g1):


> Task :init
Get more help with your project: https://guides.gradle.org/creating-new-gradle-builds

BUILD SUCCESSFUL in 11s
2 actionable tasks: 2 executed
```

我们可以得到下面这样的一个项目

```
.
├── .gitattributes
├── .gitignore
├── .gradle
│   ├── ...
├── build.gradle.kts
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
└── settings.gradle.kts
```

`build.gradle.kts`与`settings.gradle.kts`是主要的两个文件，其它`.gitattributes` `.gitignore`是Git的，`.gradle`是 Gradle 构建的缓存，`gradle/wrapper` `gradlew` `gradlew.bat`是为了保证不同的用户使用相同的 Gradle 版本

接下来运行`gradle`命令（实际与`gradle help`一样）

```
PS C:\Users\MrTT\Desktop\2513\g1> gradle

> Task :help

Welcome to Gradle 6.5.

To run a build, run gradle <task> ...

To see a list of available tasks, run gradle tasks

To see a list of command-line options, run gradle --help

To see more detail about a task, run gradle help --task <task>

For troubleshooting, visit https://help.gradle.org

BUILD SUCCESSFUL in 1s
1 actionable task: 1 executed
```

从帮助信息中，了解到运行`gradle tasks`查看所有任务

```
PS C:\Users\MrTT\Desktop\2513\g1> gradle tasks

> Task :tasks

------------------------------------------------------------
Tasks runnable from root project
------------------------------------------------------------

Build Setup tasks
-----------------
init - Initializes a new Gradle build.
wrapper - Generates Gradle wrapper files.

Help tasks
----------
buildEnvironment - Displays all buildscript dependencies declared in root project 'g1'.
components - Displays the components produced by root project 'g1'. [incubating]
dependencies - Displays all dependencies declared in root project 'g1'.
dependencyInsight - Displays the insight into a specific dependency in root project 'g1'.
dependentComponents - Displays the dependent components of components in root project 'g1'. [incubating]
help - Displays a help message.
kotlinDslAccessorsReport - Prints the Kotlin code for accessing the currently available project extensions and conventions.
model - Displays the configuration model of root project 'g1'. [incubating]
outgoingVariants - Displays the outgoing variants of root project 'g1'.
projects - Displays the sub-projects of root project 'g1'.
properties - Displays the properties of root project 'g1'.
tasks - Displays the tasks runnable from root project 'g1'.

To see all tasks and more detail, run gradle tasks --all

To see more detail about a task, run gradle help --task <task>

BUILD SUCCESSFUL in 1s
1 actionable task: 1 executed
```

默认情况下，已经存在了任务（辅助任务？），可以随便执行个看看，比如`buildEnvironment`

```
PS C:\Users\MrTT\Desktop\2513\g1> gradle buildEnvironment

> Task :buildEnvironment

------------------------------------------------------------
Root project
------------------------------------------------------------

classpath
No dependencies

A web-based, searchable dependency report is available by adding the --scan option.

BUILD SUCCESSFUL in 1s
1 actionable task: 1 executed
```

这就是一个空项目，相信你已经了解了

## 创建第一个任务

程序猿的第一个任务，必然是打印`Hello world!`，打开`build.gradle.kts`，在里面添加以下代码

```kotlin
tasks.register("hello") {
    doLast {
        println("Hello world!")
    }
}
```

`gradle` 会在`build.gradle.kts`中寻找任务，至于为什么这么写，doLast什么鬼，别问，我也不懂。等学完后应该能理解把

运行`gradle tasks --all`我们可以在Other里看到我们定义的`hello`任务，执行它`gradle -q hello`（`-q` 影藏任务以外的输出），控制台就输出`Hello world!`啦

第一个任务到此完成

## 在任务中写代码

```kotlin
tasks.register("upper") {
    doLast {
        val someString = "mY_nAmE"
        println("Original: $someString")
        println("Upper case: ${someString.toUpperCase()}")
    }
}
```

可以用 kotlin 或者 groovy 直接写脚本代码

## 任务间依赖

```kotlin
tasks.register("intro") {
    dependsOn("hello")
    doLast {
        println("I'm Gradle")
    }
}
```

*任务间依赖是懒加载的，在依赖时不需要提前定义*

执行结果为

```
PS C:\Users\MrTT\Desktop\2513\g1> gradle intro

> Task :hello
Hello world!

> Task :intro
I'm Gradle

BUILD SUCCESSFUL in 1s
```

## 动态添加任务

```kotlin
repeat(4) { counter ->
    tasks.register("task$counter") {
        doLast {
            println("I'm task number $counter")
        }
    }
}
```

几乎可以在`build.gradle.kts`中任意位置写任何代码，*repeat(4)是kotlin的语法*

## 修改已有的任务

```kotlin
tasks.named("task0") { dependsOn("task2", "task3") }
```

`named()`应该是通过任务名查询已经的任务

```kotlin
val hello1 by tasks.registering {
    doLast {
        println("Hello Earth")
    }
}
hello1 {
    doFirst {
        println("Hello Venus")
    }
}
hello1 {
    doFirst {
        println("Hello Venus2")
    }
}
hello1 {
    doLast {
        println("Hello Mars")
    }
}
hello1 {
    doLast {
        println("Hello Jupiter")
    }
}
```

结果为：

```
Hello Venus2
Hello Venus
Hello Earth
Hello Mars
Hello Jupiter
```

`doFirst` `doLast` 分别在任务的开头与结尾添加，可以多次执行，按添加顺序排序。之前`doLast`的问题解决了，但是这kotlin的语法真是怪（对习惯Java的我来说）

- https://kotlinlang.org/docs/reference/delegated-properties.html

上面是我能找的`by`的语法，至于`val a by b{}; a{}; a{}`这语法，翻遍了文档都没找到，以后再说吧

## 配置默认任务

```kotlin
defaultTasks("hello", "task0")
```

设置`gradle`执行的任务，默认是`help`

## 生命周期

```kotlin
tasks.register("distribution") {
    doLast {
        println("We build the zip with version=$version")
    }
}

tasks.register("release") {
    dependsOn("distribution")
    doLast {
        println("We release now")
    }
}

gradle.taskGraph.whenReady {
    version =
        if (hasTask(":release")) "1.0"
        else "1.0-SNAPSHOT"
}
```

whenReady在任务全部加载后触发（未开始执行），所以执行`distribution`与`release`时，得到不同的`version`

## 添加外部依赖

```kotlin
import org.apache.commons.codec.binary.Base64

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        "classpath"(group = "commons-codec", name = "commons-codec", version = "1.2")
    }
}

tasks.register("encode") {
    doLast {
        val encodedString = Base64().encode("hello world\n".toByteArray())
        println(String(encodedString))
    }
}
```

使用`commons-codec`的`Base64`


# Tasks 高级教程

# 插件的使用
