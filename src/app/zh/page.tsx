import MainPage from '@/components/layout/MainPage';
import { Metadata } from 'next';
import { getMetadata } from '@/config/metadata';

export const metadata: Metadata = getMetadata('zh');

export default function ZhPage() {
  return <MainPage lang="zh" />;
}
