import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EnglishPage, { metadata as englishMetadata } from '@/app/(marketing)/ai-video-editor/page';
import ChinesePage, { metadata as chineseMetadata } from '@/app/zh-CN/ai-video-editor/page';
import { LocalVideoWorkspace } from './platform-local-video-workspace';

vi.mock('./site-shell', () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('./platform-navigation-link', () => ({
  PlatformNavigationLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}));

const file = (name: string) => new File(['synthetic'], name, { type: 'video/webm' });

function selectFile(video: File) {
  fireEvent.change(screen.getByLabelText('Local video file'), { target: { files: [video] } });
}

function probe(name: string) {
  const call = vi.mocked(HTMLMediaElement.prototype.load).mock.contexts.find(
    node => {
      const video = node as HTMLVideoElement;
      return video.getAttribute('src') === `blob:${name}` && !video.isConnected;
    }
  );
  if (!call) throw new Error(`未找到解码探测器 ${name}`);
  return call as HTMLVideoElement;
}

async function decode(node: HTMLVideoElement, { duration = 5, width = 320, height = 180 } = {}) {
  Object.defineProperties(node, {
    duration: { value: duration }, videoWidth: { value: width }, videoHeight: { value: height },
    readyState: { value: HTMLMediaElement.HAVE_CURRENT_DATA }
  });
  await act(async () => { fireEvent.loadedData(node); });
}

describe('FrameKoi 本地视频编辑器', () => {
  const create = vi.fn((video: File) => `blob:${video.name}`);
  const revoke = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    [EnglishPage, englishMetadata, '/ai-video-editor', 'AI Video Editor', 'Choose video', 'AI Video Generator', '/ai-video-generator', 'Landscape to portrait preview'],
    [ChinesePage, chineseMetadata, '/zh-CN/ai-video-editor', 'AI 视频编辑器', '选择视频', 'AI 视频生成器', '/zh-CN/ai-video-generator', '横屏转竖屏预览']
  ] as const)('正式入口 %s 使用本地化标题、canonical 和通用工具链接', (Page, metadata, path, title, choose, link, toolPath, reframeLabel) => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(screen.getByRole('button', { name: choose })).toBeVisible();
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('href', toolPath);
    expect(screen.getByRole('link', { name: reframeLabel })).toHaveAttribute(
      'href', path.replace('/ai-video-editor', '/tools/landscape-to-portrait-video-converter-ai')
    );
    expect(metadata.title).toBe(title);
    expect(metadata.alternates?.canonical).toBe(path);
    expect(metadata.alternates?.languages).toMatchObject({ en: '/ai-video-editor', 'zh-CN': '/zh-CN/ai-video-editor' });
  });

  it('替换失败时保留旧预览，成功时重置选区并释放旧文件，移除后回焦', async () => {
    const { container } = render(<LocalVideoWorkspace locale="en" />);
    selectFile(file('first.webm'));
    const firstProbe = probe('first.webm');
    await decode(firstProbe);
    expect(firstProbe).not.toHaveAttribute('src');
    expect(screen.getByText('320 × 180 px')).toBeVisible();
    const end = screen.getByRole('spinbutton', { name: 'End (seconds)' });
    fireEvent.change(end, { target: { value: '3' } });

    selectFile(file('broken.webm'));
    const brokenProbe = probe('broken.webm');
    await act(async () => { fireEvent.error(brokenProbe); });
    expect(screen.getByRole('alert')).toHaveTextContent('could not open');
    expect(container.querySelector('video')).toHaveAttribute('src', 'blob:first.webm');
    expect(end).toHaveValue(3);
    expect(revoke.mock.calls).toEqual([['blob:broken.webm']]);

    selectFile(file('replacement.webm'));
    await decode(probe('replacement.webm'), { duration: 2, width: 160, height: 90 });
    expect(screen.getByRole('spinbutton', { name: 'End (seconds)' })).toHaveValue(2);
    expect(screen.getByText('160 × 90 px')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Remove video' }));
    expect(screen.getByRole('button', { name: 'Choose video' })).toHaveFocus();
    expect(container.querySelector('video')).toBeNull();
    expect(revoke.mock.calls).toEqual([['blob:broken.webm'], ['blob:first.webm'], ['blob:replacement.webm']]);
  });

  it('取消较早的探测并在页面离开时释放已解码视频', async () => {
    const { container, unmount } = render(<LocalVideoWorkspace locale="en" />);
    selectFile(file('older.webm'));
    const older = probe('older.webm');
    selectFile(file('latest.webm'));
    expect(older).not.toHaveAttribute('src');
    await decode(older);
    expect(container.querySelector('video')).toBeNull();
    await decode(probe('latest.webm'));
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(container.querySelector('video')).toBeNull();
    unmount();
    expect(revoke.mock.calls).toEqual([['blob:older.webm'], ['blob:latest.webm']]);
  });

  it('禁止无效选区，从有效起点播放并在终点停止', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const { container } = render(<LocalVideoWorkspace locale="en" />);
    selectFile(file('synthetic.webm'));
    await decode(probe('synthetic.webm'));
    const video = container.querySelector('video')!;
    await decode(video);
    const start = screen.getByRole('spinbutton', { name: 'Start (seconds)' });
    const end = screen.getByRole('spinbutton', { name: 'End (seconds)' });
    const button = screen.getByRole('button', { name: 'Play selection' });
    fireEvent.change(start, { target: { value: '2' } });
    fireEvent.change(end, { target: { value: '2' } });
    expect(button).toBeDisabled();
    expect(end).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(end, { target: { value: '6' } });
    expect(button).toBeDisabled();
    fireEvent.change(end, { target: { value: '4' } });
    await act(async () => { fireEvent.click(button); });
    expect(video.currentTime).toBe(2);
    expect(play).toHaveBeenCalledOnce();
    video.currentTime = 4.2;
    fireEvent.timeUpdate(video);
    expect(video.pause).toHaveBeenCalled();
    expect(video.currentTime).toBe(4);
    expect(screen.getByRole('button', { name: 'Play selection' })).toBeEnabled();
  });
});
