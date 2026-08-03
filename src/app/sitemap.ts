import type { MetadataRoute } from "next";

const SITE_URL = "https://hub-nav.ale160.com";

// 静态导出要求显式声明
export const dynamic = "force-static";

/**
 * 构建时自动生成 sitemap.xml（替代手写 public/sitemap.xml）
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${SITE_URL}/`,
          "zh-CN": `${SITE_URL}/zh/`,
        },
      },
    },
    {
      url: `${SITE_URL}/zh/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/`,
          "zh-CN": `${SITE_URL}/zh/`,
        },
      },
    },
  ];
}
