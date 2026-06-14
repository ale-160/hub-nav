# hub-nav-open

[English](./README.en.md) | 中文

一个操作系统风格的浏览器导航起始页，支持拖拽、文件夹、主题切换和多语言。

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-0.1.8-green.svg)](https://github.com/ale-160/hub-nav)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://react.dev/)

## 功能特性

- 🎨 **桌面网格与拖拽系统**：仿 OS 风格的响应式网格布局，支持图标与文件夹的拖拽排序
- 📁 **文件夹管理系统**：应用归类、展开/折叠、拖入/拖出、搜索自动展开
- 📱 **多页面切屏**：CSS Scroll Snap 横向滑动切换页面，支持跨页面拖拽移动
- 🔀 **拖拽排序**：支持图标与文件夹的手动拖拽排序，直观易用
- 🔍 **全局搜索过滤**：基于 cmdk 的命令面板，支持模糊搜索
- 🌙 **主题切换**：亮暗模式切换，基于 @wrksz/themes 实现
- 🖼️ **壁纸设置**：预设渐变背景、自定义壁纸 URL、本地图片上传
- 💾 **配置管理**：基于 LocalStorage 的配置持久化，支持导入导出、版本迁移和自动备份
- 🌍 **多语言支持**：中英文切换，文案集中管理
- ⚙️ **操作模式定制**：混合模式、电脑端模式、移动端模式、自定义模式
- 🛠️ **设置面板管理**：左侧 Tab 导航 + 右侧内容面板，包含外观、搜索、数据管理和备份管理
- 📦 **备份管理**：自动备份当前配置，最多保留 5 个备份，总大小限制 5MB，支持可视化管理和一键恢复
- 🖱️ **右键长按菜单**：右键/长按触发上下文菜单，支持编辑、删除、隐藏等操作
- ✨ **图标渲染系统**：支持 favicon、内置图标、自定义图片三种模式
- 🎯 **跨页面拖拽**：图标/文件夹可从一个页面拖拽到另一个页面，自动同步数据结构
- 🔄 **版本迁移**：智能检测配置文件版本，自动执行迁移流程，确保向后兼容

## 技术栈

- **核心框架**：Next.js 16.2.4 + React 19.2.4 (App Router)
- **UI/样式**：Tailwind CSS 4 + @tailwindcss/postcss 4 + shadcn/ui（基于 Radix UI 1.4.3）
- **主题管理**：@wrksz/themes 0.9.2（替代 next-themes，提供更丰富的主题定制能力）
- **关键库**：
  - @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0 + @dnd-kit/modifiers 9.0.0（拖拽系统）
  - lucide-react 1.14.0（图标库）
  - cmdk 1.1.1（命令面板）
  - sonner 2.0.7（Toast 通知）
  - class-variance-authority 0.7.1
  - tailwind-merge 3.5.0
  - clsx 2.1.1
  - tw-animate-css 1.4.0
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
│   ├── app/                    # Next.js App Router 页面入口
│   │   ├── layout.tsx         # 根布局（集成 ThemeProvider）
│   │   ├── page.tsx           # 主应用页面
│   │   └── globals.css        # 全局样式
│   ├── components/
│   │   ├── layout/            # 核心业务组件
│   │   │   ├── Page/          # 页面相关组件
│   │   │   │   ├── BlankContextMenu.tsx
│   │   │   │   ├── PageDroppable.tsx
│   │   │   │   └── PageNavigation.tsx
│   │   │   ├── PageContainer.tsx  # 多页容器
│   │   │   ├── PageContent.tsx    # 单页内容
│   │   │   ├── PageIndicator.tsx  # 页面指示器
│   │   │   ├── PageManager.tsx    # 页面管理器
│   │   │   ├── Folder.tsx     # 文件夹组件
│   │   │   └── Icon.tsx       # 图标组件
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   │   ├── icon-selector/ # 图标选择器
│   │   │   ├── modals/        # 模态框组件
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── settings-modal.tsx
│   │   │   └── ...
│   │   └── providers/         # 全局 Provider
│   │       └── ErrorBoundary.tsx
│   ├── config/                # 站点配置
│   │   ├── metadata.ts       # 页面元数据
│   │   ├── sitemap.ts        # 站点地图生成
│   │   └── structuredData.ts # 结构化数据（JSON-LD）
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useConfig.ts       # 配置管理
│   │   ├── useTheme.ts        # 主题管理
│   │   ├── useLocalStorage.ts # 本地存储
│   │   ├── useImportExport.ts # 导入导出
│   │   ├── useIconFolderManager.ts # 图标和文件夹管理
│   │   ├── useSearch.ts       # 搜索功能
│   │   ├── useContextMenu.ts  # 右键菜单
│   │   └── ...
│   ├── lib/                   # 工具库
│   │   └── configManager.ts   # 配置管理器
│   ├── utils/                 # 通用工具函数
│   │   ├── config/            # 配置相关工具
│   │   │   ├── types.ts       # 类型定义
│   │   │   ├── version.ts     # 版本管理
│   │   │   ├── backup.ts      # 备份管理
│   │   │   ├── exporter.ts    # 配置导出
│   │   │   ├── importer.ts    # 配置导入
│   │   │   ├── defaults.ts    # 默认配置值
│   │   │   ├── validator.ts   # 配置校验
│   │   │   ├── migrations.ts  # 版本迁移实现
│   │   │   └── migration-registry.ts # 迁移注册表
│   │   ├── favicon-preloader.ts  # Favicon 预加载器
│   │   ├── favicon-strategies.ts # Favicon URL 生成策略
│   │   ├── configExport.ts    # 配置导出工具
│   │   ├── iconOperations.ts  # 图标操作工具
│   │   ├── icon.tsx           # 图标渲染工具
│   │   ├── ui.ts              # UI 工具函数
│   │   └── url.ts             # URL 工具函数
│   └── data/                  # 数据文件
│       ├── i18n.ts            # 国际化文案
│       └── icons.ts           # 图标数据
├── public/                    # 静态资源
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

- 📧 邮箱：[ale160@126.com](mailto:ale160@126.com)

---

## 支持与赞助 💖

如需支持本项目的持续开发，请前往统一赞赏页面：

👉 [https://ale160.com/sponsor](https://ale160.com/sponsor)


---

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目采用 Apache License 2.0 许可证 - 详见 [LICENSE](LICENSE) 文件。
