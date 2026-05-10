# hub-nav-open

一个操作系统风格的浏览器导航起始页，支持拖拽、文件夹、主题切换和多语言。

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/Hub-Nav/hub-nav)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://react.dev/)

## 功能特性

- 🎨 **桌面网格与拖拽系统**：仿 OS 风格的响应式网格布局，支持图标与文件夹的拖拽排序
- 📁 **文件夹管理系统**：应用归类、展开/折叠、拖入/拖出、搜索自动展开
- 🔍 **全局搜索过滤**：基于 cmdk 的命令面板，支持模糊搜索
- 🌙 **主题切换**：亮暗模式切换，基于 next-themes 实现
- 🖼️ **壁纸设置**：预设渐变背景、自定义壁纸 URL、本地图片上传
- 💾 **配置管理**：基于 LocalStorage 的配置持久化，支持导入导出
- 🌍 **多语言支持**：中英文切换，文案集中管理
- ⚙️ **操作模式定制**：混合模式、电脑端模式、移动端模式、自定义模式
- 🛠️ **设置面板管理**：左侧 Tab 导航 + 右侧内容面板
- 🖱️ **右键长按菜单**：右键/长按触发上下文菜单，支持编辑、删除、隐藏等操作
- 📱 **多页面切屏**：CSS Scroll Snap 横向滑动切换页面
- ✨ **图标渲染系统**：支持 favicon、内置图标、自定义图片三种模式
- 🎯 **跨页面拖拽**：图标/文件夹可从一个页面拖拽到另一个页面，自动同步数据结构

## 技术栈

- **核心框架**：Next.js 16.2.4 + React 19.2.4 (App Router)
- **UI/样式**：Tailwind CSS 4.2.4 + shadcn/ui（基于 Radix UI 1.4.3）
- **关键库**：
  - @dnd-kit/core 6.3.1（拖拽系统）
  - lucide-react 1.14.0（图标库）
  - cmdk 1.1.1（命令面板）
  - next-themes 0.4.6（主题管理）
  - class-variance-authority 0.7.1
  - tailwind-merge 3.5.0
- **工具链**：TypeScript 5.x, ESLint 9.x

## 快速开始

### 安装依赖

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:8525](http://localhost:8525) 查看应用。

### 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
hub-nav-open/
├── src/
│   ├── app/
│   │   └── page.tsx          # 主应用页面
│   ├── components/
│   │   ├── layout/           # 核心业务组件
│   │   │   ├── PageContainer.tsx
│   │   │   ├── PageContent.tsx
│   │   │   ├── PageIndicator.tsx
│   │   │   ├── AppGrid.tsx
│   │   │   ├── Folder.tsx
│   │   │   └── Icon.tsx
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/               # shadcn/ui 组件
│   │       ├── SettingsModal.tsx
│   │       ├── IconSelector.tsx
│   │       ├── Modal.tsx
│   │       ├── Button.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   └── lib/
│       ├── configManager.ts  # 配置持久化
│       ├── builtinIcons.ts   # 内置图标库
│       ├── strings.ts        # 中文文案
│       ├── strings-en.ts     # 英文文案
│       └── urlUtils.ts
├── public/                   # 静态资源
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## **隐私声明**

本项目重视用户隐私保护。在使用本软件时，请留意以下信息：

1. **数据存储**：所有用户配置数据均存储在浏览器本地的 LocalStorage 中，不会上传至任何服务器。
2. **数据收集**：本软件不会收集、传输或分享任何用户个人信息。
3. **第三方服务**：用户添加的自定义应用图标可能会访问第三方网站获取 favicon，此类请求由浏览器直接发起。
4. **Cookie 使用**：本软件仅使用必要的本地存储实现功能，不使用追踪性 Cookie。
5. **数据删除**：用户可以随时通过浏览器设置清除 LocalStorage 数据，或使用软件内的重置功能删除所有配置。

---

## 联系方式

如有问题、建议或反馈，欢迎通过以下方式联系我们：

- 📧 邮箱：[hubnav@126.com](mailto:hubnav@126.com)

---

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目采用 Apache License 2.0 许可证 - 详见 [LICENSE](LICENSE) 文件。