import { PlatformGhibliPage } from '@/components/platform-ghibli-page';
import { ghibliMetadata } from '@/lib/platform-ghibli-metadata';

export const metadata = ghibliMetadata('en');
export default function Page() { return <PlatformGhibliPage locale="en" />; }
