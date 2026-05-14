# hub-nav-open 项目开发指南 (AGENTS.md)

> **欢迎参与 hub-nav-open 项目开发！** 本文档是项目的核心开发规范与架构摘要，旨在帮助 AI 助手和开发者快速理解项目逻辑并高效协作。

## 1. 项目简介

hub-nav-open 是一个操作系统的浏览器导航起始页。用户可以通过拖拽管理应用图标、创建文件夹分类、切换多页面布局，并支持全局搜索、主题定制（亮暗模式/壁纸）及配置持久化。

**核心特性**：
- 🖥️ **桌面网格系统**：支持多页面切屏、图标拖拽排序、跨页移动。
- 📁 **文件夹管理**：支持展开/折叠、内部拖拽、搜索自动定位。
- 🔍 **全局搜索**：基于 cmdk 的快速过滤面板。
- 🎨 **主题定制**：支持亮/暗模式切换、自定义壁纸及字体颜色适配。
- 💾 **本地持久化**：所有配置自动保存至 LocalStorage，支持导入导出。

## 2. 技术栈

- **核心框架**：Next.js 16+ (App Router, Static Export) + React 19
- **语言**：TypeScript (Strict Mode)
- **样式方案**：Tailwind CSS 4 + shadcn/ui (Radix UI Primitives)
- **状态管理**：React Hooks (useState, useReducer) + LocalStorage
- **关键库**：@dnd-kit (拖拽), lucide-react (图标), next-themes (主题), cmdk (搜索)

## 3. 项目结构与核心职责

### 3.1 源代码目录 (src/)

| 目录 | 核心职责 | 关键文件说明 |
| :--- | :--- | :--- |
| `src/app/` | 页面入口与根布局 | `page.tsx`: 全局状态中心，处理添加/删除/移动等核心逻辑。<br>`layout.tsx`: 根布局，集成 ThemeProvider 与 ErrorBoundary。 |
| `src/components/layout/` | 核心业务组件 | `PageContainer.tsx`: 多页容器，管理全局拖拽上下文。<br>`PageContent.tsx`: 单页内容渲染，负责网格布局。<br>`Folder.tsx`: 文件夹组件，处理嵌套逻辑与搜索联动。 |
| `src/components/ui/` | 基础 UI 组件 | 基于 shadcn/ui 封装的 Modal, Button, Input, DropdownMenu 等。**注意：文件命名使用 kebab-case**（如 `icon-selector.tsx`, `settings-modal.tsx`）。 |
| `src/hooks/` | 自定义 Hooks | `useTheme.ts`: 主题切换与壁纸应用。<br>`useLocalStorage.ts`: 跨标签页同步的配置持久化。<br>`useImportExport.ts`: 配置导入导出功能。<br>`useIconFolderManager.ts`: 图标和文件夹管理。 |
| `src/lib/` | 工具与配置管理 | `configManager.ts`: 配置读写中心，处理数据迁移与结构化存储。<br>`builtinIcons.ts`: 常用网站内置图标集合。 |
| `src/utils/config/` | 配置相关工具模块 | `types.ts`: 配置类型定义。<br>`version.ts`: 版本管理。<br>`defaults.ts`: 默认值填充。<br>`validator.ts`: 数据验证。<br>`backup.ts`: 备份与回滚。<br>`migrations.ts`: 迁移管理器。<br>`migration-registry.ts`: 迁移函数注册表。<br>`exporter.ts`: 配置导出。<br>`importer.ts`: 配置导入。 |
| `src/utils/` | 通用工具函数 | `configExport.ts`: 配置导出工具。<br>`iconOperations.ts`: 图标操作工具。 |

### 3.2 静态资源 (public/)
存放 Favicon、预设壁纸及 SVG 图标。注意：构建产物位于 `out/` 目录。

## 4. 编码规范与最佳实践

### 4.1 TypeScript 严格模式
- **禁止使用 `any`**：优先使用 `unknown` 配合类型守卫，或定义明确的 Interface。
- **组件类型**：所有函数组件必须定义 `Props` 接口。
- **Hook 返回**：自定义 Hook 应返回明确的元组或对象类型。

### 4.2 Next.js App Router 约束
- **客户端声明**：涉及浏览器 API（如 `window`, `localStorage`）或交互逻辑的组件，必须在文件顶部声明 `'use client'`。
- **SSR 安全**：严禁在渲染阶段直接访问 `window`。请使用 `useEffect` 或 `typeof window !== 'undefined'` 进行保护，避免 Hydration Mismatch。
- **静态导出**：项目采用 `output: 'export'`，不支持服务端动态路由或 Server Actions。

### 4.3 样式系统 (Tailwind CSS)
- **语义化类名**：优先使用 `bg-background`, `text-foreground` 等 CSS 变量类名，以支持主题自动适配。
- **禁止硬编码**：严禁在代码中写死颜色值（如 `#ffffff`），必须通过 Tailwind 配置或 CSS 变量管理。
- **变体管理**：复杂组件的样式变体建议使用 `class-variance-authority` (CVA) 进行管理。
- **CSS 变量语法**：项目使用 Tailwind CSS v4，支持 `bg-(--variable)` 简写语法（会自动编译为 `background-color: var(--variable)`）。

### 4.4 文件命名规范
- **组件文件**：使用 **kebab-case**（短横线分隔），如 `icon-selector.tsx`, `settings-modal.tsx`
- **组件函数**：使用 **PascalCase**，如 `export function IconSelector()`
- **导入路径**：使用别名 `@/components/ui/icon-selector`
- **原因**：符合 Next.js App Router 和 shadcn/ui 生态约定，避免文件系统大小写敏感问题

### 4.5 拖拽交互 (@dnd-kit)
- **传感器配置**：为兼顾移动端长按与桌面端拖拽，需合理配置 `MouseSensor` 和 `TouchSensor` 的激活约束（如 `delay: 250ms`）。
- **性能优化**：拖拽过程中应避免频繁触发重渲染，合理使用 `useMemo` 缓存列表数据。

## 5. 配置管理与数据流

- **中心化存储**：所有用户配置（页面数据、图标列表、文件夹结构）均通过 `src/lib/configManager.ts` 统一管理。
- **持久化机制**：利用 `src/hooks/useLocalStorage.ts` 实现 LocalStorage 的读写与跨标签页同步（通过 `storage` 事件监听）。
- **向后兼容**：在 `configManager` 中实现了版本检测与自动迁移逻辑，确保旧版配置能平滑升级。
- **备份管理**：导入前自动备份当前配置，最多保留 5 个备份，总大小限制为 5MB。设置界面提供备份可视化和管理功能。
- **导出格式**：采用带元数据的标准格式（包含 `_schema`、`_version`、`_meta`、`data`），支持版本迁移和验证。

## 6. 任务执行建议

1. **修改前确认**：涉及核心数据结构（如 `pages`, `icons`）变更时，请先查阅 `src/lib/configManager.ts` 的定义。
2. **构建验证**：每次修改完成后，请运行 `npm run build` 确保无 TypeScript 错误且静态导出成功。
3. **一致性检查**：新增功能时，请确保同时适配亮色与暗色模式，并检查移动端视图的响应式表现。
4. **文件命名**：新增组件文件时使用 kebab-case 命名（如 `my-component.tsx`），导出函数使用 PascalCase（如 `export function MyComponent()`）。

---
**最后更新**：2026-05-14  
**维护说明**：本文档随项目架构演进同步更新，是外部协作者理解本项目的第一入口。
