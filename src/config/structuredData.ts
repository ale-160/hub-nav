// 核心个人信息
export const PERSON_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ale",
  url: "https://ale160.com",
  sameAs: [
    "https://github.com/ale-160",
    "https://space.bilibili.com/325710677"
  ],
  jobTitle: "独立开发者 & 内容创作者",
  description: "从谷底出发，用代码和故事对抗命运。"
};

export const PERSON_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ale",
  url: "https://ale160.com",
  sameAs: [
    "https://github.com/ale-160",
    "https://space.bilibili.com/325710677"
  ],
  jobTitle: "Independent Developer & Content Creator",
  description: "Rising from the bottom, fighting fate with code and stories."
};

// 网站信息
export const WEBSITE_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com",
  description: "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。",
  author: {
    "@type": "Person",
    name: "Ale"
  }
};

export const WEBSITE_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com",
  description: "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management.",
  author: {
    "@type": "Person",
    name: "Ale"
  }
};

// WebApplication 信息
export const WEBAPP_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com",
  description: "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。完全本地存储，注重隐私。",
  applicationCategory: "BrowserExtension",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY"
  },
  author: {
    "@type": "Person",
    name: "Ale"
  },
  sameAs: ["https://ale160.com"]
};

export const WEBAPP_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com",
  description: "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management. 100% local, privacy-focused.",
  applicationCategory: "BrowserExtension",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  author: {
    "@type": "Person",
    name: "Ale"
  },
  sameAs: ["https://ale160.com"]
};

export function getStructuredData(lang: string = "en") {
  const isEn = lang === "en";
  return [
    isEn ? PERSON_DATA_EN : PERSON_DATA_ZH,
    isEn ? WEBSITE_DATA_EN : WEBSITE_DATA_ZH,
    isEn ? WEBAPP_DATA_EN : WEBAPP_DATA_ZH
  ];
}
