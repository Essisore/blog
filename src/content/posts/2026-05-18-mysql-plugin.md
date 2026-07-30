---
title: "MySQL 插件介绍"
description: "Introduce MySQL Plugin"
date: "May 18 2026"
tags: ["MySQL", "Plugin"]
draft: true
---

---

这是 MySQL 源码中的一个 CMake 模板文件,用于在编译时生成内置插件(builtin plugins)的注册代码。

作用概述

sql/sql_builtin.cc.in 是一个 CMake 输入模板(.in 后缀表示需要 CMake 在配置阶段做变量替换),最终会被处理成 ${CMAKE_BINARY_DIR}/sql/sql_builtin.cc。

工作机制

1. 模板替换:在 CMakeLists.txt:2455 中通过 CONFIGURE_FILE 处理:
   CONFIGURE_FILE(${CMAKE_SOURCE_DIR}/sql/sql_builtin.cc.in
   ${CMAKE_BINARY_DIR}/sql/sql_builtin.cc)
1. 其中 @mysql_mandatory_plugins@ 和 @mysql_optional_plugins@ 这两个 CMake 变量会根据用户选择编译进哪些插件被替换成具体的插件符号列表。
1. 生成两个数组:


    - mysql_mandatory_plugins[]:强制插件,无论如何都要编入 mysqld 的插件,例如:
        - builtin_binlog_plugin(二进制日志)
      - builtin_sha256_password_plugin / builtin_caching_sha2_password_plugin(认证插件)
      - builtin_daemon_keyring_proxy_plugin(密钥环代理)
      - builtin_vidx_plugin
    - mysql_optional_plugins[]:可选插件,根据 CMake 编译选项(如 -DWITH_xxx=1)静态链接进 mysqld 的插件(例如 InnoDB、MyISAM、performance_schema 等存储引擎或插件)。

3. 链接强制:服务器启动时通过这两个数组遍历并初始化所有静态编译的插件。storage/perfschema/unittest/CMakeLists.txt 中的注释也提到——把 sql_builtin.cc 加进单测目标,是为了强制链接这些插件符号。

一句话总结

它是 MySQL 在构建期根据用户选择的插件,自动生成"内置插件注册表"的代码模板,决定 mysqld 静态编译进哪些插件以及哪些是必带的。
