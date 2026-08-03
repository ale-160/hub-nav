import MainPage from '@/components/layout/MainPage';
import ClientRedirect from '@/components/seo/ClientRedirect';
import {JsonLd} from '@/components/seo/json-ld';
import { Metadata } from 'next';
import { getMetadata } from '@/config/metadata';

export const metadata: Metadata = getMetadata('en');

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "hub-nav",
  url: "https://hub-nav.ale160.com/",
  description:
    "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management. 100% local, privacy-focused.",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  inLanguage: "en",
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

export default function EnglishPage() {
  return (
    <>
      <JsonLd data={appJsonLd}/>
      <ClientRedirect />
      <MainPage lang="en" />
    </>
  );
}
