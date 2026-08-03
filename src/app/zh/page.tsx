import MainPage from '@/components/layout/MainPage';
import {JsonLd} from '@/components/seo/json-ld';
import { Metadata } from 'next';
import { getMetadata } from '@/config/metadata';

export const metadata: Metadata = getMetadata('zh');

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com/zh/",
  description:
    "一个美观的操作系统风格浏览器主页，支持拖拽、文件夹、暗色模式、自定义壁纸和多页管理。完全本地存储，注重隐私。",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  inLanguage: "zh-CN",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  author: {
    "@type": "Person",
    name: "Ale",
    url: "https://ale160.com"
  }
};

export default function ZhPage() {
  return (
    <>
      <JsonLd data={appJsonLd}/>
      <MainPage lang="zh" />
    </>
  );
}
