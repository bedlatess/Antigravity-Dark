# Antigravity Dark 🌌 (失重深色版)

**Antigravity Dark** 是一个为 Komari 监控项目打造的高级感、高性能前端主题。设计灵感源自“零重力”概念，旨在为你的服务器基础设施提供一种悬浮、极简且深邃的沉浸式深色视觉体验。

本项目基于 **Next.js**、**TypeScript**、**Tailwind CSS v4** 和 **Shadcn UI** 构建，并打包为可作为 Komari 主题使用的静态站点。

[English](README.md) | [演示站点](https://probes.top) | [下载主题文件](https://github.com/bedlatess/Antigravity-Dark/releases/latest)

> **注意：** 本仓库仅包含前端部分。你需要一个正在运行中的 Komari 后端实例供该 UI 调用。或者，你也可以下载主题文件，并通过 Komari 管理后台上传；这是推荐的使用方式。

![预览](https://github.com/tonyliuzj/komari-next/blob/main/preview.png?raw=true)
![深色主题](https://github.com/tonyliuzj/komari-next/blob/main/images/dark-theme.png?raw=true)

## ✨ 核心理念

* **失重感 UI**：采用悬浮卡片组件与平滑的过渡效果，模拟“失重”环境。
* **深空模式**：精心调校的深色调色板，在减少视觉疲劳的同时保持极高的信息对比度。
* **动态数据流**：实时服务器指标、延迟波动图以及全球节点分布的高保真呈现。

## 🚀 功能特性

* **全球交互地图**：通过高响应能力的地图实时监控全球节点。
* **实时情报仪表盘**：实时展示服务器与节点状态、负载及延迟图表。
* **剩余价值计算器**：内置服务器剩余价值计算工具。
* **极致自定义选项**：
    * **6 种星系配色**：默认、海洋、日落、森林、午夜、玫瑰。
    * **4 种重力布局**：经典、现代、极简、详细 —— 每种布局都有独特的视觉设计与元素位置。
    * **4 种图表样式**：圆环、进度条、柱状图、极简 —— 全部会跟随所选颜色主题。
* **高度个性化**：支持自定义背景图 URL，可在仪表盘中显示或隐藏单独的指标。
* **多语言适配**：基于 `react-i18next` 的全量国际化（i18n）支持。
* **全端响应式**：基于 Shadcn + Tailwind CSS 的响应式布局，完美适配各类屏幕。

## 🛠️ 技术栈

* **框架**：Next.js（App Router，静态导出）
* **语言**：TypeScript、React
* **UI 方案**：Shadcn UI + Radix UI primitives、Tailwind CSS v4
* **图表库**：Recharts
* **状态/数据**：自定义 Context、RPC2 客户端、基于 fetch 的 API

## ⚙️ 开发指南

### 环境要求
* **Node.js** 22 或更高版本（推荐使用 LTS）
* 一个正在运行且浏览器可访问的 **Komari 后端**（API）

### 1. 初始化
克隆本仓库并安装依赖：
```bash
git clone [https://github.com/bedlatess/Antigravity-Dark.git](https://github.com/bedlatess/Antigravity-Dark.git)
cd Antigravity-Dark
npm install
```
### 2. 配置 API 目标地址
在项目根目录创建 .env.local 文件，并设置后端基础 URL：
```bash
NEXT_PUBLIC_API_TARGET=http://你的后端实例地址:25774
```
### 3. 运行与构建
```bash
npm run dev
npm run build
```
## 📄 开源协议
* **本项目基于 MIT License 开源。**

* **Project maintained by bedlatess**

* **如果你喜欢这个设计，请点一个 ⭐ Star 支持一下！**
