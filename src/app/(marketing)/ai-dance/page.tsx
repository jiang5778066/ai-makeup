import type { Metadata } from 'next';
import { PlatformDancePage } from '@/components/platform-dance-page';
export const metadata: Metadata = {
  title: 'AI Dance Generator: Make Your Photo Dance',
  description: 'Explore dance templates and preview a photo with a dance reference locally. Generation is currently unavailable.',
  alternates: { canonical: '/ai-dance', languages: { en: '/ai-dance', 'zh-CN': '/zh-CN/ai-dance' } },
};
export default function Page() { return <PlatformDancePage locale="en" />; }
