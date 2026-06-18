---
title: "json_table 及其实现"
description: "MySQL json_table 功能和实现方式笔记"
date: "May 27 2026"
tags: ["MySQL", "JSON", "Internal"]
draft: true
---

# json_table 及其实现

## json_table 功能简介

### 概述

[json_table](https://dev.mysql.com/doc/refman/9.7/en/json-table-functions.html#function_json-table) 是 [MySQL 8.0.4 RC 版本](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-4.html) 引入的 JSON 表函数，用于将 JSON 文档（的一部分）转换为关系表：区别于其他的 json 函数，json_table 是一个表函数，返回的是一个表，而不是一个标量值。P.S. json_table 也是 MySQL 的第一个表函数。

### 语法

```sql
JSON_TABLE(
    expr,
    path COLUMNS (column_list)
)   [AS] alias
```

- expr：JSON 表达式，用于指定要解析的 JSON 数据
- path：JSON 路径表达式，用于指定要提取的 JSON 数据的路径
- column_list：列定义列表，用于指定要提取的 JSON 数据的列名和数据类型
- alias：别名，用于指定返回的表的别名

#### JSON Path 语法

path 写法参考：[JSON Path Syntax](https://dev.mysql.com/doc/refman/9.7/en/json.html#json-path-syntax)

`$` 表示当前文档根节点，后接一个或多个路径段。

路径段（Path legs）：

| 类型               | 语法       | 示例         | 说明                     |
| ------------------ | ---------- | ------------ | ------------------------ |
| 对象成员           | `.key`     | `$.name`     | 访问对象的某个字段       |
| 对象成员（带引号） | `."key"`   | `$."my-key"` | key 含特殊字符时用双引号 |
| 数组元素           | `[N]`      | `$[0]`       | N 为非负整数，从 0 开始  |
| 数组最后元素       | `[last]`   | `$[last]`    | `last` 是最右元素的别名  |
| 数组范围           | `[M to N]` | `$[2 to 10]` | 取数组第 2～10 个元素    |

通配符：

| 语法  | 含义                             |
| ----- | -------------------------------- |
| `.*`  | 对象中**所有成员**的值           |
| `[*]` | 数组中**所有元素**的值           |
| `**`  | 递归匹配（前缀可选，后缀必须有） |

#### columns 写法

- `name FOR ORDINALITY`：行号，等价于建表语句中的自增列
- `name type PATH string_path [on_empty] [on_error]`：表示要提取的 JSON 数据的列名、数据类型和路径，json_table 会提取 json 中的数据，然后将其强制转换为列类型
- `name type EXISTS PATH path`：用于判断 json 中数据存在对应的路径，type 正常应该是 int
- `NESTED [PATH] path COLUMNS (column_list)`：用于嵌套解析 JSON 数据，path 表示要解析的 JSON 数据的路径，column_list 表示要提取的 JSON 数据的列名和数据类型

示例：

```sql
SELECT *
FROM JSON_TABLE(
    '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]',
    '$[*]' COLUMNS (
        name VARCHAR(50) PATH '$.name',
        age INT PATH '$.age'
    )
) AS jt;
+-------+------+
| name  | age  |
+-------+------+
| Alice |   30 |
| Bob   |   25 |
+-------+------+
2 rows in set (0.001 sec)
```

## 实现方式

## 问题

1. 声明的数据类型和json中的对不上会怎么样？如创建column指定int类型，但实际上json中是字符串
2.

## 参考

1. [JSON_TABLE - The Best of Both Worlds](https://dev.mysql.com/blog-archive/json_table-the-best-of-both-worlds/)
2. [WL#8867: Add JSON table functions](https://dev.mysql.com/worklog/task/?id=8867)
