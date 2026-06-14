import MainPage from '@/components/layout/MainPage';
import ClientRedirect from '@/components/seo/ClientRedirect';
import { Metadata } from 'next';
import { getMetadata } from '@/config/metadata';

export const metadata: Metadata = getMetadata('en');

export default function EnglishPage() {
  return (
    <>
      <ClientRedirect />
      <MainPage lang="en" />
    </>
  );
}
