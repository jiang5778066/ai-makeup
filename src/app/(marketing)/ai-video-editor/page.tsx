import { LocalVideoEditorPage } from '@/components/platform-local-video-editor-page';
import { localVideoEditorMetadata } from '@/lib/platform-local-video-editor-data';

export const metadata = localVideoEditorMetadata('en');

export default function Page() {
  return <LocalVideoEditorPage locale="en" />;
}
