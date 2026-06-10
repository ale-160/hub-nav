# Contributing Guide (CONTRIBUTING)

[中文](./CONTRIBUTING.md) | English

Thank you for your interest in the hub-nav-open project! We welcome any form of contribution, including but not limited to code optimization, feature development, documentation improvement, and bug fixes.

---

## Fork & Pull Request Workflow

### 1. Fork the Repository

Click the **Fork** button in the upper right corner of the GitHub page to copy the repository to your account.

### 2. Clone Locally

```bash
git clone https://github.com/your-username/hub-nav.git
cd hub-nav
```

### 3. Create Feature Branch

Please use clear branch naming conventions:

| Branch Type | Naming Format | Description |
|---------|----------|------|
| Feature Development | `feature/feature-name` | New feature development |
| Bug Fix | `fix/issue-description` | Fix known issues |
| Documentation Update | `docs/document-name` | Documentation-related changes |
| Code Refactoring | `refactor/module-name` | Code refactoring and optimization |

Examples:

```bash
git checkout -b feature/add-dark-wallpaper
git checkout -b fix/icon-drag-issue
```

### 4. Commit Code

```bash
git add .
git commit -m "feat(settings): add dark theme wallpaper option"
```

### 5. Push to Remote

```bash
git push origin feature/add-dark-wallpaper
```

### 6. Create Pull Request

1. Click **Compare & pull request** on the GitHub repository page
2. Fill in the PR description, explaining the changes and reasons
3. Link related Issues (if any)
4. Click **Create pull request**

### 7. Code Review Process

- Maintainers will review within 1-3 days
- Please respond to review feedback promptly and make modifications if necessary
- After review passes, maintainers will merge the code

---

## Code Standards

### TypeScript Strict Mode

The project uses TypeScript strict mode. Please follow these rules:

- **No `any` Allowed**: Prefer `unknown` with type guards or define explicit Interfaces
- **Component Types**: All function components must define a `Props` interface
- **Hook Returns**: Custom Hooks should return explicit tuple or object types

```typescript
// ✅ Correct Example
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ Avoid
// function Button(props: any) { ... }
```

### ESLint Check

Ensure code passes ESLint check before committing:

```bash
npm run lint
```

### File Naming Conventions

The project uses **kebab-case** (hyphen-separated) for component file naming, conforming to Next.js App Router and shadcn/ui ecosystem conventions.

| Type | Naming Convention | Example |
|-----|---------|------|
| Component Files | kebab-case | `icon-selector.tsx`, `settings-modal.tsx` |
| Component Functions | PascalCase | `export function IconSelector()` |
| Hook Files | camelCase, use prefix | `useLocalStorage.ts` |
| Utility Functions | camelCase | `extractDomain()` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_COUNT` |

**Important Notes**:
- Component file names use kebab-case (e.g., `icon-selector.tsx`)
- Component export functions use PascalCase (e.g., `export function IconSelector()`)
- Use alias paths when importing (e.g., `import { IconSelector } from '@/components/ui/icon-selector'`)
- This convention aligns with Next.js App Router official recommendations, avoiding case sensitivity issues

---

## Commit Guidelines

The project uses [Conventional Commits](https://www.conventionalcommits.org/) format.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type

| Type | Description |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation update |
| `style` | Code formatting (no functional changes) |
| `refactor` | Code refactoring |
| `test` | Testing related |
| `chore` | Build/tool related |

### Scope

| Scope | Description |
|-------|------|
| `core` | Core functionality |
| `settings` | Settings panel |
| `search` | Search functionality |
| `theme` | Theme related |
| `i18n` | Internationalization |
| `docs` | Documentation |

### Examples

```bash
feat(search): add search history feature

fix(drag): fix cross-page icon drag and drop issue

docs(readme): update installation instructions

style(ui): adjust button spacing
```

---

## Issue Reporting

### Issue Guidelines

When submitting an Issue, please include:

- **Problem Description**: Clear description of the issue
- **Reproduction Steps**: Detailed operation steps
- **Expected Behavior**: What you expect to happen
- **Actual Behavior**: What actually happened
- **Environment Information**: Browser, device, operating system

### Feature Requests

We welcome new feature suggestions! When submitting a feature request, please explain:

- Use case for the feature
- Expected implementation approach
- User experience improvement

---

## License

By contributing code, you agree to open source your code under the [Apache License 2.0](LICENSE).

---

**Last Updated**: 2026-05-14