# hub-nav-open

[中文](./README.md) | English

An OS-style browser navigation start page with drag-and-drop, folders, theme switching, and multi-language support.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-0.1.8-green.svg)](https://github.com/ale-160/hub-nav)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://react.dev/)

## Features

- 🎨 **Desktop Grid & Drag System**: OS-style responsive grid layout with drag-and-drop sorting for icons and folders
- 📁 **Folder Management System**: App categorization, expand/collapse, drag-in/drag-out, search auto-expand
- 📱 **Multi-page Switching**: CSS Scroll Snap horizontal sliding page switching, supports cross-page drag-and-drop
- 🔀 **Drag-and-drop Sorting**: Manual drag-and-drop sorting for icons and folders, intuitive and easy to use
- 🔍 **Global Search Filter**: cmdk-based command palette with fuzzy search support
- 🌙 **Theme Switching**: Light/dark mode switching, implemented with @wrksz/themes
- 🖼️ **Wallpaper Settings**: Preset gradient backgrounds, custom wallpaper URLs, local image upload
- 💾 **Configuration Management**: LocalStorage-based configuration persistence with import/export, version migration, and auto-backup
- 🌍 **Multi-language Support**: Chinese/English switching with centralized text management
- ⚙️ **Operation Mode Customization**: Hybrid mode, desktop mode, mobile mode, custom mode
- 🛠️ **Settings Panel Management**: Left Tab navigation + right content panel, including appearance, search, data management, and backup management
- 📦 **Backup Management**: Auto-backup of current configuration, up to 5 backups, 5MB total size limit, with visual management and one-click restore
- 🖱️ **Right-click/Long-press Menu**: Context menu triggered by right-click/long-press, supporting edit, delete, hide, etc.
- ✨ **Icon Rendering System**: Supports favicon, built-in icons, and custom image modes
- 🎯 **Cross-page Drag**: Icons/folders can be dragged from one page to another, with automatic data structure synchronization
- 🔄 **Version Migration**: Intelligent detection of configuration file versions with automatic migration flow for backward compatibility

## Tech Stack

- **Core Framework**: Next.js 16.2.4 + React 19.2.4 (App Router)
- **UI/Styling**: Tailwind CSS 4 + @tailwindcss/postcss 4 + shadcn/ui (based on Radix UI 1.4.3)
- **Theme Management**: @wrksz/themes 0.9.2 (replaces next-themes, provides richer theme customization capabilities)
- **Key Libraries**:
  - @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0 + @dnd-kit/modifiers 9.0.0 (drag system)
  - lucide-react 1.14.0 (icon library)
  - cmdk 1.1.1 (command palette)
  - sonner 2.0.7 (Toast notifications)
  - class-variance-authority 0.7.1
  - tailwind-merge 3.5.0
  - clsx 2.1.1
  - tw-animate-css 1.4.0
- **Toolchain**: TypeScript 5.x, ESLint 9.x

## Quick Start

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development Mode

```bash
npm run dev
```

Open [http://localhost:8525](http://localhost:8525) to view the application.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
hub-nav-open/
├── src/
│   ├── app/                    # Next.js App Router page entries
│   │   ├── layout.tsx         # Root layout (integrates ThemeProvider)
│   │   ├── page.tsx           # Main application page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── layout/            # Core business components
│   │   │   ├── Page/          # Page-related components
│   │   │   │   ├── BlankContextMenu.tsx
│   │   │   │   ├── PageDroppable.tsx
│   │   │   │   └── PageNavigation.tsx
│   │   │   ├── PageContainer.tsx  # Multi-page container
│   │   │   ├── PageContent.tsx    # Single page content
│   │   │   ├── PageIndicator.tsx  # Page indicator
│   │   │   ├── PageManager.tsx    # Page manager
│   │   │   ├── Folder.tsx     # Folder component
│   │   │   └── Icon.tsx       # Icon component
│   │   ├── ui/                # shadcn/ui base components
│   │   │   ├── icon-selector/ # Icon selector
│   │   │   ├── modals/        # Modal components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── settings-modal.tsx
│   │   │   └── ...
│   │   └── providers/         # Global providers
│   │       └── ErrorBoundary.tsx
│   ├── config/                # Site configuration
│   │   ├── metadata.ts       # Page metadata
│   │   ├── sitemap.ts        # Sitemap generation
│   │   └── structuredData.ts # Structured data (JSON-LD)
│   ├── hooks/                 # Custom hooks
│   │   ├── useConfig.ts       # Configuration management
│   │   ├── useTheme.ts        # Theme management
│   │   ├── useLocalStorage.ts # Local storage
│   │   ├── useImportExport.ts # Import/export
│   │   ├── useIconFolderManager.ts # Icon and folder management
│   │   ├── useSearch.ts       # Search functionality
│   │   ├── useContextMenu.ts  # Context menu
│   │   └── ...
│   ├── lib/                   # Utility library
│   │   └── configManager.ts   # Configuration manager
│   ├── utils/                 # General utility functions
│   │   ├── config/            # Configuration-related utilities
│   │   │   ├── types.ts       # Type definitions
│   │   │   ├── version.ts     # Version management
│   │   │   ├── backup.ts      # Backup management
│   │   │   ├── exporter.ts    # Configuration export
│   │   │   ├── importer.ts    # Configuration import
│   │   │   ├── defaults.ts    # Default configuration values
│   │   │   ├── validator.ts   # Configuration validation
│   │   │   ├── migrations.ts  # Version migration implementations
│   │   │   └── migration-registry.ts # Migration registry
│   │   ├── favicon-preloader.ts  # Favicon preloader
│   │   ├── favicon-strategies.ts # Favicon URL generation strategies
│   │   ├── configExport.ts    # Configuration export utilities
│   │   ├── iconOperations.ts  # Icon operation utilities
│   │   ├── icon.tsx           # Icon rendering utilities
│   │   ├── ui.ts              # UI utility functions
│   │   └── url.ts             # URL utility functions
│   └── data/                  # Data files
│       ├── i18n.ts            # Internationalization text
│       └── icons.ts           # Icon data
├── public/                    # Static resources
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## **Privacy Statement**

This project values user privacy protection. When using this software, please note the following:

1. **Data Storage**: All user configuration data is stored locally in the browser's LocalStorage and will not be uploaded to any server.
2. **Data Collection**: This software does not collect, transmit, or share any user personal information.
3. **Third-party Services**: Custom app icons added by users may access third-party websites to retrieve favicons. Such requests are initiated directly by the browser.
4. **Cookie Usage**: This software only uses necessary local storage to implement features and does not use tracking cookies.
5. **Data Deletion**: Users can clear LocalStorage data at any time through browser settings or use the reset function within the software to delete all configurations.

---

## Contact

If you have any questions, suggestions, or feedback, please feel free to contact us:

- 📧 Email: [ale160@126.com](mailto:ale160@126.com)

---

## Support & Sponsorship 💖

To support the continued development of this project, please visit our unified sponsorship page:

👉 [https://ale160.com/sponsor](https://ale160.com/sponsor)


---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
