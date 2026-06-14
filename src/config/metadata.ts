import { Metadata } from "next";

export const METADATA_ZH = {
  title: "hub-nav · 美观的浏览器主页和起始页",
  description: "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。完全本地存储，注重隐私。",
  keywords: [
    "hub-nav",
    "浏览器主页",
    "起始页",
    "新标签页",
    "书签管理器",
    "桌面风格",
    "拖拽",
    "暗色模式",
    "隐私保护",
    "本地存储",
    "自定义壁纸"
  ],
  authors: [{ name: "Ale", url: "https://ale160.com" }],
  creator: "Ale",
  publisher: "Ale",
  openGraph: {
    title: "hub-nav · 美观的浏览器主页和起始页",
    description: "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。",
    url: "https://hub-nav.ale160.com/zh",
    siteName: "hub-nav",
    locale: "zh_CN",
    type: "website" as const,
    images: [
      {
        url: "https://ale160.com/images/logo-icon.png",
        width: 1200,
        height: 630,
        alt: "hub-nav 预览图"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "hub-nav · 美观的浏览器主页和起始页",
    description: "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。",
    images: ["https://ale160.com/images/logo-icon.png"],
    creator: "@ale160"
  },
  alternates: {
    canonical: "https://hub-nav.ale160.com/zh/",
    languages: {
      "en": "https://hub-nav.ale160.com/",
      "zh-CN": "https://hub-nav.ale160.com/zh/"
    }
  }
};

export const METADATA_EN = {
  title: "hub-nav · Beautiful Browser Homepage & Start Page",
  description: "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management. 100% local, privacy-focused.",
  keywords: [
    "hub-nav",
    "browser homepage",
    "start page",
    "new tab",
    "bookmark manager",
    "desktop style",
    "drag and drop",
    "dark mode",
    "privacy focused",
    "local storage",
    "custom wallpaper"
  ],
  authors: [{ name: "Ale", url: "https://ale160.com" }],
  creator: "Ale",
  publisher: "Ale",
  openGraph: {
    title: "hub-nav · Beautiful Browser Homepage & Start Page",
    description: "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management.",
    url: "https://hub-nav.ale160.com/",
    siteName: "hub-nav",
    locale: "en_US",
    type: "website" as const,
    images: [
      {
        url: "https://ale160.com/images/logo-icon.png",
        width: 1200,
        height: 630,
        alt: "hub-nav Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "hub-nav · Beautiful Browser Homepage & Start Page",
    description: "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management.",
    images: ["https://ale160.com/images/logo-icon.png"],
    creator: "@ale160"
  },
  alternates: {
    canonical: "https://hub-nav.ale160.com/",
    languages: {
      "en": "https://hub-nav.ale160.com/",
      "zh-CN": "https://hub-nav.ale160.com/zh/"
    }
  }
};

export function getMetadata(lang: string = "en"): Metadata {
  const metadata = lang === "en" ? METADATA_EN : METADATA_ZH;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: metadata.authors,
    creator: metadata.creator,
    publisher: metadata.publisher,
    icons: {
      icon: "https://ale160.com/favicon.png"
    },
    formatDetection: {
      email: false,
      telephone: false
    },
    openGraph: metadata.openGraph,
    twitter: metadata.twitter,
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    alternates: metadata.alternates
  };
}

// Viewport 配置
export const viewport = {
  width: "device-width",
  initialScale: 1
};
