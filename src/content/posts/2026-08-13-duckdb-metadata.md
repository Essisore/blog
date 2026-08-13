---
title: "duckdb插件metadata解析"
description: "duckdb插件metadata解析"
date: "2026-08-13"
tags: ["duckdb", "database", "metadata"]
draft: false
---

```text
┌─────────────────────────────────────────┐
│  真正的动态库内容 (dlopen 加载的部分)      │  0 ~ (filesize - 512)
├─────────────────────────────────────────┤
│  Metadata 区 (256 字节 = 8×32 字段)        │  (filesize-512) ~ (filesize-256)
├─────────────────────────────────────────┤
│  Signature 区 (256 字节 RSA 签名)          │  (filesize-256) ~ filesize
└─────────────────────────────────────────┘
```

按「从**文件末尾**倒数」的偏移量整理成表（这样写法与文件总大小无关，最适合直接读取）：

| 语义字段 | 相对文件末尾的字节区间 | 说明 |
|---|---|---|
| `signature` | `[-256, 0)` | 256 字节，RSA 签名 |
| `magic_value` | `[-288, -256)` | 固定为 `"4"` + 31 个 `\0`；`"4"` 大概率是 footer 格式版本号 |
| `platform` | `[-320, -288)` | 如 `linux_amd64`、`osx_arm64` |
| `duckdb_version` / `duckdb_capi_version` | `[-352, -320)` | 含义取决于 ABI 类型，见第 4 节 |
| `extension_version` | `[-384, -352)` | 插件自身版本号 |
| `extension_abi_metadata` | `[-416, -384)` | ABI 类型字符串：`"CPP"` / `"C_STRUCT"` / `"C_STRUCT_UNSTABLE"` / 空 |
| 保留字段 ×3 | `[-512, -416)` | 当前未使用，源码注释标注为 "future extension" |


```bash
tail -c 512 your_ext.duckdb_extension | head -c 256 | xxd
```
