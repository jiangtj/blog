---
title: MySQL5.7 IN与EXISTS
date: 2017-12-1
updated: 2017-12-1
categories: [后端]
tags: [MySQL]
---

> 文章中的表参考这里的创建<http://blog.csdn.net/stevendbaguo/article/details/73467649>

### 数据表的创建

* 制造数据
```sql
DROP TABLE IF EXISTS test; 
CREATE TABLE test( 
    ID INT(10) NOT NULL, 
    `Name` VARCHAR(20) DEFAULT '' NOT NULL, 
    PRIMARY KEY( ID ) 
)ENGINE=INNODB DEFAULT CHARSET utf8; 
```

<!-- more -->

* 创建生成测试数据的存储过程
```sql
DROP PROCEDURE IF EXISTS pre_test; 
DELIMITER //
CREATE PROCEDURE pre_test() 
BEGIN 
DECLARE i INT DEFAULT 0; 
SET autocommit = 0; 
WHILE i<4000000 DO 
INSERT INTO test ( ID,`Name` ) VALUES( i, CONCAT( 'Carl', i ) ); 
SET i = i+1; 
IF i%10000 = 0 THEN 
COMMIT; 
END IF; 
END WHILE; 
END; //
DELIMITER ;
```
运行存储过程
* 创建子表
```sql
CREATE TABLE test_bak AS SELECT * FROM test LIMIT 1000;
CREATE INDEX ind_t_id ON test(id);
SHOW CREATE TABLE test;
CREATE INDEX ind_t1_id ON test_bak(id);
```

### SQL测试
   
[SQL]    
SELECT * FROM test a LEFT JOIN test_bak b ON a.id = b.id LIMIT 5000;    
时间: 0.017s   
  
[SQL]   
SELECT * FROM test a LIMIT 5000;   
时间: 0.003s
  
[SQL]   
SELECT * FROM test a WHERE a.ID in (SELECT ID FROM test_bak) LIMIT 5000;   
时间: 0.004s   
   
[SQL]   
SELECT * FROM test a WHERE EXISTS(SELECT 1 FROM test_bak b WHERE b.id = a.id) LIMIT 5000;    
时间: 19.255s    
    
[SQL]    
SELECT * FROM test_bak b WHERE b.ID in (SELECT ID FROM test) LIMIT 5000;     
时间: 0.003s     
    
[SQL]    
SELECT * FROM test_bak b WHERE EXISTS(SELECT 1 FROM test a WHERE b.id = a.id) LIMIT 5000;       
时间: 0.006s    
     
[SQL]   
SELECT * FROM test a WHERE a.`Name` in (SELECT `Name` FROM test_bak) LIMIT 1000;   
时间: 0.101s   
    
[SQL]    
SELECT * FROM test a WHERE EXISTS(SELECT 1 FROM test_bak b WHERE b.`Name` = a.`Name`) LIMIT 1000;   
时间: 0.229s  

注意：最后两条LIMIT别大于1000   

### 原因

MySQL自某个版本起（不记得了，逃~~），对于in中无与外表的数据做条件判断的查询，会优化为join方式执行。这比EXISTS高效的多    
当然，in中内表不能与外表的数据做条件判断，否则请用join    
 