### 第六次作业 

杨培灏 516021910233

### 一. 概述

作业使用Vue.js和d3.js

- 交互性可视化

- 基于Vue-Router的多页面联动沟通

- 基于Vuex抽离出公共的数据处理逻辑

### 二. 目录结构

作业的目录结构如下

```shell
├─dist						# 编译结果
│  ├─css
│  ├─fonts
│  ├─js
│  └─static
│      └─data
│          ├─country
│          └─statistic
├─public					# 静态数据
│  └─static
│      └─data
│          ├─country
│          └─statistic
└─src
    ├─assets
    │  └─geo
    ├─components              # 三个页面
    │  ├─ComparePage
    │  ├─CountryPage
    │  ├─GlobalPage
    │  └─PublicComponents
    │      └─Heading
    ├─router				# 路由选项
    ├─store					# 公共数据逻辑
    └─utils					
```

### 四. 运行测试

根目录下调试

```shell
npm install
npm run serve
```

**注**：若出现对`import()`的报错，可能是使用了全局安装过的webpack，使用`npm install webpack@4.28.4 -g`  全局安装4.28.4版webpack。我们需要使用动态import，而最新版本的webpack中有关于动态import的bug尚未修复（[Webpack Issue](https://github.com/webpack/webpack/issues/8656)）。