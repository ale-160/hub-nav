import React from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * JSON-LD 结构化数据注入组件（SEO）
 * 纯服务端渲染，不参与客户端交互
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
