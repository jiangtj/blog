---
title: Java动态代理小例子.
date: 2016-7-18
updated: 2016-7-18
categories: [后端]
tags: [设计模式]
---
### 例子
1，先创建teacher接口   
```java
public interface Teacher {
	void manageWork(String s);
}
```
2,创建teacher实现类   
```java
public class TeacherA implements Teacher {

	@Override
	public void manageWork(String s) {
		// TODO Auto-generated method stub
		System.out.println(this.getClass().getSimpleName()+"开始布置作业："+s);
	}

}
```

<!-- more -->

3,创建teacher代理类,java 的动态代理就是通过Proxy.newProxyInstance这个静态方法生成   
```java
public class TeacherProxy implements InvocationHandler {
	
	private Object teacher;
	
	public void setTeacher(Class<?> cls){
		try {
			teacher =cls.newInstance();
		} catch (InstantiationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static Teacher getTeacher(Class<?> cls){
		TeacherProxy proxy=new TeacherProxy();
		proxy.setTeacher(cls);
		return (Teacher) Proxy.newProxyInstance(cls.getClassLoader(), cls.getInterfaces(), proxy);
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args)
			throws Throwable {
		// TODO Auto-generated method stub
		//System.out.println("代理类名字："+proxy.getClass().getName());
		System.out.println(teacher.getClass().getSimpleName()+"的课代表通知老师");
		Object o=method.invoke(teacher, args);
		System.out.println(teacher.getClass().getSimpleName()+"的任务完成");
		return o;
	}

}
```
接下来我们在main中写一下代码运行,其中student只是普通的类，不在这里写出来了   
```java
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Teacher teacherProxyA=TeacherProxy.getTeacher(TeacherA.class);
		Teacher teacherProxyB=TeacherProxy.getTeacher(TeacherB.class);
		teacherProxyA.manageWork("语文作业");
		teacherProxyB.manageWork("数学作业");
		new StudentA().doWork();
		new StudentB().doWork();
	}
```
运行后能看到下面的结果
```java
TeacherA的课代表通知老师
TeacherA开始布置作业：语文作业
TeacherA的任务完成
TeacherB的课代表通知老师
TeacherB开始布置作业：数学作业
TeacherB的任务完成
StudentA开始做作业
StudentB开始做作业
```
### 说明
如上面结果所示，teacherProxyA是由Proxy产生的动态代理类，它拥有接口所对应的方法，调用这个方法其实就是调用invoke方法。
在invoke中，调用的是他所代理对象的方法。   
所以说，动态代理很强大，他可以在代理过程中执行拦截或者记录日志，spring的aop核心便是这个。
除此之外，不得不提一下retrofit框架，这是面向android的RESTful网络请求框架，他的核心也是动态代理，不过，对于所有的请求都提供一样的实现，而所有的参数都通过flied值与注解来得到，然后通过okhttp提交并返回call对象。这种实现很精彩。
