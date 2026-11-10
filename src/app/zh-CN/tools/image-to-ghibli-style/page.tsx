import { PlatformGhibliPage } from '@/components/platform-ghibli-page';
import { ghibliMetadata } from '@/lib/platform-ghibli-metadata';

export const metadata = ghibliMetadata('zh-CN');
export default function Page() { return <PlatformGhibliPage locale="zh-CN" />; }
