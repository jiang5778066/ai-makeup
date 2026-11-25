import { LocalVideoEditorPage } from '@/components/platform-local-video-editor-page';
import { localVideoEditorMetadata } from '@/lib/platform-local-video-editor-data';

export const metadata = localVideoEditorMetadata('zh-CN');

export default function Page() {
  return <LocalVideoEditorPage locale="zh-CN" />;
}
