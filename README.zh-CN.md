# FridgeMind Mobile

*FridgeMind 学生项目的 Expo / React Native 移动客户端。*


[English](README.md) | [简体中文](README.zh-CN.md)

**导航：**[状态](#项目状态) · [启动](#启动) · [项目文件](#项目文件)


本仓库是 FridgeMind 学生项目的 Expo / React Native 移动客户端。

应用提供手机端界面。服务行为和硬件联动依赖项目中分别配置的组件；仅凭本仓库不能证明端到端部署或识别效果。

## 项目状态

学生项目移动端；服务与硬件行为取决于单独配置的项目组件。

## 启动

~~~sh
npm ci
npx expo start
~~~

本地 API 地址在应用配置中设置。请勿在公开文档或提交中写入机器专属地址和凭据。

## 项目文件

- App.js：应用入口
- assets/：应用资源
- config.js：本地 API 配置
- package.json 和 package-lock.json：JavaScript 依赖
