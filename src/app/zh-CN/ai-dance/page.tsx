import type { Metadata } from 'next';
import { PlatformDancePage } from '@/components/platform-dance-page';
export const metadata: Metadata = {
  title: 'AI 舞蹈生成器：让照片跳舞',
  description: '探索舞蹈模板，在本机预览照片与舞蹈参考。当前尚未开放生成。',
  alternates: { canonical: '/zh-CN/ai-dance', languages: { en: '/ai-dance', 'zh-CN': '/zh-CN/ai-dance' } },
};
export default function Page() { return <PlatformDancePage locale="zh-CN" />; }
