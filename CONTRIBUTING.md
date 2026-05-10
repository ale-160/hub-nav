# 贡献指南 (CONTRIBUTING)

感谢您对 hub-nav-open 项目的兴趣！我们欢迎任何形式的贡献，包括但不限于代码优化、功能开发、文档完善和问题修复。

---

## Fork 与 Pull Request 流程

### 1. Fork 仓库

点击 GitHub 页面右上角的 **Fork** 按钮，将仓库复制到您的账户下。

### 2. 克隆本地

```bash
git clone https://github.com/您的用户名/hub-nav.git
cd hub-nav
```

### 3. 创建功能分支

请使用清晰的分支命名规范：

| 分支类型 | 命名格式 | 说明 |
|---------|----------|------|
| 功能开发 | `feature/功能名称` | 新功能开发 |
| Bug 修复 | `fix/问题描述` | 修复已知问题 |
| 文档更新 | `docs/文档名称` | 文档相关修改 |
| 代码重构 | `refactor/模块名称` | 代码重构优化 |

示例：

```bash
git checkout -b feature/新增深色壁纸
git checkout -b fix/修复图标拖拽问题
```

### 4. 提交代码

```bash
git add .
git commit -m "feat(settings): 新增深色主题壁纸选项"
```

### 5. 推送到远程

```bash
git push origin feature/新增深色壁纸
```

### 6. 创建 Pull Request

1. 在 GitHub 仓库页面点击 **Compare & pull request**
2. 填写 PR 描述，说明改动内容和原因
3. 关联相关 Issue（如有）
4. 点击 **Create pull request**

### 7. Code Review 流程

- 维护者会在 1-3 天内进行审查
- 请及时响应审查反馈，必要时进行修改
- 审查通过后，维护者会合并代码

---

## 代码规范

### TypeScript 严格模式

项目采用 TypeScript 严格模式，请遵循以下规则：

- **禁止使用 `any`**：优先使用 `unknown` 配合类型守卫，或定义明确的 Interface
- **组件类型**：所有函数组件必须定义 `Props` 接口
- **Hook 返回**：自定义 Hook 应返回明确的元组或对象类型

```typescript
// ✅ 正确示例
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ 避免
function Button(props: any) { ... }
```

### ESLint 检查

提交前请确保代码通过 ESLint 检查：

```bash
npm run lint
```

### 文件命名规范

项目采用 **kebab-case**（短横线分隔）命名组件文件，符合 Next.js App Router 和 shadcn/ui 生态约定。

| 类型 | 命名规范 | 示例 |
|-----|---------|------|
| 组件文件 | kebab-case | `icon-selector.tsx`, `settings-modal.tsx` |
| 组件函数 | PascalCase | `export function IconSelector()` |
| Hook 文件 | camelCase，use 前缀 | `useLocalStorage.ts` |
| 工具函数 | camelCase | `extractDomain()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PAGE_COUNT` |

**重要说明**：
- 组件文件名使用 kebab-case（如 `icon-selector.tsx`）
- 组件导出函数使用 PascalCase（如 `export function IconSelector()`）
- 导入时使用别名路径（如 `import { IconSelector } from '@/components/ui/icon-selector'`）
- 此规范与 Next.js App Router 官方推荐一致，避免大小写敏感问题

### 文件组织规范

```
src/
├── app/                    # 页面入口
├── components/
│   ├── layout/            # 核心业务组件
│   ├── ui/                # 基础 UI 组件
│   └── providers/        # 全局 Provider
├── hooks/                 # 自定义 Hooks
└── lib/                   # 工具函数和配置
```

---

## Commit 规范

项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式。

### 格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |

### Scope 范围

| Scope | 说明 |
|-------|------|
| `core` | 核心功能 |
| `settings` | 设置面板 |
| `search` | 搜索功能 |
| `theme` | 主题相关 |
| `i18n` | 国际化 |
| `docs` | 文档 |

### 示例

```bash
feat(search): 新增搜索历史记录功能

fix(drag): 修复跨页面拖拽图标丢失问题

docs(readme): 更新安装说明

style(ui): 调整按钮间距
```

---

## 测试要求

### 新功能测试

新功能提交前，请确保：

1. 功能在开发环境中正常运行
2. 亮暗两种主题模式均测试通过
3. 移动端视图响应式表现正常

### Bug 修复

Bug 修复请提供：

1. 问题的复现步骤
2. 修复前后的对比
3. 测试环境说明（浏览器版本、设备类型等）

### 运行现有测试

```bash
# 运行开发服务器
npm run dev

# 构建测试
npm run build

# 类型检查
npm run typecheck

# ESLint 检查
npm run lint
```

---

## 开发环境

### 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:8525
```

---

## 问题反馈

### Issue 规范

提交 Issue 时，请包含：

- **问题描述**：清晰描述遇到的问题
- **复现步骤**：详细的操作步骤
- **预期行为**：您期望的结果
- **实际行为**：实际发生的情况
- **环境信息**：浏览器、设备、操作系统

### 功能建议

我们欢迎新功能建议！提交功能建议时，请说明：

- 功能的使用场景
- 预期的实现方式
- 对用户体验的提升

---

## 许可证

通过贡献代码，您同意将您的代码以 [Apache License 2.0](LICENSE) 许可证开源。

---

**最后更新**：2026-05-11
