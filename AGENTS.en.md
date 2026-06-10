# hub-nav-open Development Guide (AGENTS.md)

[中文](./AGENTS.md) | English

> **Welcome to hub-nav-open development!** This document is the core development specification and architecture summary of the project, designed to help AI assistants and developers quickly understand the project logic and collaborate efficiently.

## 1. Project Overview

hub-nav-open is a browser navigation start page for operating systems. Users can manage application icons through drag-and-drop, create folder categories, switch multi-page layouts, and support global search, theme customization (light/dark mode/wallpaper), and configuration persistence.

**Core Features:**
- 🖥️ **Desktop Grid System**: Supports multi-page screen switching, icon drag-and-drop sorting, and cross-page movement.
- 📁 **Folder Management**: Supports expand/collapse, internal drag-and-drop, and search auto-location.
- 🔍 **Global Search**: Fast filtering panel based on cmdk.
- 🎨 **Theme Customization**: Supports light/dark mode switching, custom wallpapers, and font color adaptation (based on @wrksz/themes).
- 💾 **Local Persistence**: All configurations are automatically saved to LocalStorage, supporting import and export.
- 📦 **Backup Management**: Automatically backs up before import, keeps up to 5 backups, with a total size limit of 5MB.
- 🔄 **Version Migration**: Intelligently detects configuration file versions and automatically executes migration processes.

## 2. Technology Stack

- **Core Framework**: Next.js 16+ (App Router, Static Export) + React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI Primitives)
- **Theme Management**: @wrksz/themes 0.9.2 (replaces next-themes)
- **State Management**: React Hooks (useState, useReducer) + LocalStorage
- **Key Libraries**: @dnd-kit (drag-and-drop), lucide-react (icons), cmdk (search), sonner (Toast)

## 3. Project Structure & Core Responsibilities

### 3.1 Source Code Directory (src/)

| Directory | Core Responsibility | Key File Description |
| :--- | :--- | :--- |
| `src/app/` | Page Entry & Root Layout | `page.tsx`: Global state center, handles core logic like add/delete/move.<br>`layout.tsx`: Root layout, integrates ThemeProvider and ErrorBoundary. |
| `src/components/layout/` | Core Business Components | `PageContainer.tsx`: Multi-page container, manages global drag-and-drop context.<br>`PageContent.tsx`: Single page content rendering, handles grid layout.<br>`Folder.tsx`: Folder component, handles nested logic and search linkage. |
| `src/components/ui/` | Basic UI Components | Modal, Button, Input, DropdownMenu, etc., encapsulated based on shadcn/ui. **Note: File naming uses kebab-case** (e.g., `icon-selector.tsx`, `settings-modal.tsx`). |
| `src/hooks/` | Custom Hooks | `useTheme.ts`: Theme switching and wallpaper application.<br>`useLocalStorage.ts`: Cross-tab synchronized configuration persistence.<br>`useConfig.ts`: Core configuration management Hook.<br>`useImportExport.ts`: Configuration import/export functionality.<br>`useIconFolderManager.ts`: Icon and folder management. |
| `src/lib/` | Utilities & Configuration Management | `configManager.ts`: Configuration read/write center, handles data migration and structured storage.<br>`builtinIcons.ts`: Built-in icon collection for popular websites. |
| `src/utils/config/` | Configuration-related Utilities | `types.ts`: Configuration type definitions.<br>`version.ts`: Version management.<br>`defaults.ts`: Default value filling.<br>`validator.ts`: Data validation.<br>`backup.ts`: Backup and rollback.<br>`migrations.ts`: Migration manager.<br>`migration-registry.ts`: Migration function registry.<br>`exporter.ts`: Configuration export.<br>`importer.ts`: Configuration import. |
| `src/utils/` | General Utility Functions | `configExport.ts`: Configuration export utilities.<br>`iconOperations.ts`: Icon operation utilities. |

### 3.2 Static Resources (public/)
Stores Favicon, preset wallpapers, and SVG icons. Note: Build output is located in the `out/` directory.

## 4. Coding Standards & Best Practices

### 4.1 TypeScript Strict Mode
- **No `any` Allowed**: Prefer `unknown` with type guards or define explicit Interfaces.
- **Component Types**: All function components must define a `Props` interface.
- **Hook Returns**: Custom Hooks should return explicit tuple or object types.

### 4.2 Next.js App Router Constraints
- **Client Declaration**: Components involving browser APIs (e.g., `window`, `localStorage`) or interaction logic must declare `'use client'` at the top of the file.
- **SSR Safety**: Never directly access `window` during rendering. Use `useEffect` or `typeof window !== 'undefined'` for protection to avoid Hydration Mismatch.
- **Static Export**: The project uses `output: 'export'`, which does not support server-side dynamic routes or Server Actions.

### 4.3 Styling System (Tailwind CSS)
- **Semantic Class Names**: Prefer CSS variable class names like `bg-background`, `text-foreground` to support automatic theme adaptation.
- **No Hardcoding**: Never hardcode color values (e.g., `#ffffff`) in code; must manage through Tailwind configuration or CSS variables.
- **Variant Management**: Complex component style variants should use `class-variance-authority` (CVA) for management.
- **CSS Variable Syntax**: The project uses Tailwind CSS v4, supporting `bg-(--variable)` shorthand syntax (automatically compiles to `background-color: var(--variable)`).

### 4.4 File Naming Conventions
- **Component Files**: Use **kebab-case** (hyphen-separated), e.g., `icon-selector.tsx`, `settings-modal.tsx`
- **Component Functions**: Use **PascalCase**, e.g., `export function IconSelector()`
- **Import Paths**: Use aliases like `@/components/ui/icon-selector`
- **Reason**: Conforms to Next.js App Router and shadcn/ui ecosystem conventions, avoiding file system case sensitivity issues

### 4.5 Drag-and-Drop Interaction (@dnd-kit)
- **Sensor Configuration**: To support both mobile long-press and desktop drag-and-drop, configure `MouseSensor` and `TouchSensor` activation constraints appropriately (e.g., `delay: 250ms`).
- **Performance Optimization**: Avoid frequent re-renders during drag operations; use `useMemo` to cache list data appropriately.

## 5. Configuration Management & Data Flow

- **Centralized Storage**: All user configurations (page data, icon lists, folder structures) are managed through `src/lib/configManager.ts`.
- **Persistence Mechanism**: Uses `src/hooks/useLocalStorage.ts` to implement LocalStorage read/write and cross-tab synchronization (via `storage` event listening).
- **Backward Compatibility**: Version detection and automatic migration logic are implemented in `configManager` to ensure smooth upgrades from old configurations.
- **Backup Management**: Automatically backs up current configuration before import, keeps up to 5 backups with a total size limit of 5MB. Settings interface provides backup visualization and management.
- **Export Format**: Uses a standard format with metadata (including `_schema`, `_version`, `_meta`, `data`), supporting version migration and validation.

## 6. Task Execution Recommendations

1. **Pre-Modification Confirmation**: When changes involve core data structures (e.g., `pages`, `icons`), please first consult the definitions in `src/lib/configManager.ts`.
2. **Build Verification**: After each modification, run `npm run build` to ensure no TypeScript errors and successful static export.
3. **Consistency Check**: When adding new features, ensure compatibility with both light and dark modes, and check responsive behavior on mobile views.
4. **File Naming**: Use kebab-case for new component files (e.g., `my-component.tsx`) and PascalCase for export functions (e.g., `export function MyComponent()`).

---
**Last Updated**: 2026-05-14  
**Maintenance Note**: This document is updated in sync with project architecture evolution and serves as the primary entry point for external collaborators to understand the project.