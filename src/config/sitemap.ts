// sitemap配置 - 添加新项目只需要在这里添加即可
const SITEMAP_PROJECTS = [
  {
    path: "",
    priority: 1.0,
    changefreq: "weekly" as const,
    lang: "en" as const,
  },
  {
    path: "zh",
    priority: 0.9,
    changefreq: "weekly" as const,
    lang: "zh" as const,
  },
];

export function generateSitemapXml(): string {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  SITEMAP_PROJECTS.forEach((item) => {
    const loc = item.path
      ? `https://hub-nav.ale160.com/${item.path}/`
      : "https://hub-nav.ale160.com/";

    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://hub-nav.ale160.com/"/>
    <xhtml:link rel="alternate" hreflang="zh" href="https://hub-nav.ale160.com/zh/"/>
  </url>
`;
  });

  xml += `</urlset>`;
  return xml;
}

// 控制台输出sitemap.xml内容（用于手动复制到public目录）
if (typeof require !== "undefined" && require.main === module) {
  console.log(generateSitemapXml());
}
