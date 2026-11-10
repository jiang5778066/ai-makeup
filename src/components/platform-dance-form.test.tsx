import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState, useSyncExternalStore } from 'react';
import { DanceForm } from './platform-dance-form';
import { DanceMediaSlot, type DanceMediaDependencies } from '@/lib/platform-dance-media-state';
vi.mock('./platform-dance-video', () => ({ DanceVideo: () => <div data-testid="template-preview" /> }));
afterEach(cleanup);
function fixture() {
  let count = 0;
  const jobs: { resolve: (value?: number) => void; reject: (e: Error) => void }[] = [];
  const deps: DanceMediaDependencies = { create: () => `blob:${++count}`, revoke: vi.fn(), probe: () => new Promise<number | undefined>((resolve, reject) => jobs.push({ resolve, reject })) };
  const photoSlot = new DanceMediaSlot('photo', deps), videoSlot = new DanceMediaSlot('video', deps);
  function Harness() {
    const [photo] = useState(photoSlot), [video] = useState(videoSlot);
    const p = useSyncExternalStore(photo.subscribe, photo.read), v = useSyncExternalStore(video.subscribe, video.read);
    return <DanceForm locale="en" photo={p} video={v} photoSlot={photo} videoSlot={video} selectTemplate={id => video.choose({ source: 'template', id, url: '/template.mp4', name: 'template' })} preview={vi.fn()} />;
  }
  render(<Harness />); return { jobs, photoSlot, videoSlot, deps };
}
describe('AI Dance 双媒体表单', () => {
  it('示例与六模板可独立选择；损坏照片替换保留两项并显示可恢复错误', async () => {
    const { jobs } = fixture();
    fireEvent.click(screen.getByRole('button', { name: 'Use sample photo: Reference image 10' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use dance template: Baby Dance Gestures' }));
    const sample = screen.getByRole('img', { name: 'Reference image 10' });
    const input = screen.getByLabelText('Choose local photo') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['bad'], 'bad.png', { type: 'image/png' })] } }); jobs[0].reject(new Error('broken'));
    await screen.findByRole('alert'); expect(sample).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Use dance template: Baby Dance Gestures' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Generate dance/ })).toBeDisabled(); expect(input.value).toBe('');
    fireEvent.change(input, { target: { files: [] } }); expect(sample).toBeInTheDocument();
  });
  it('成功本地视频替换模板；清除照片不影响视频，清除视频恢复上传', async () => {
    const { jobs } = fixture(); fireEvent.click(screen.getByRole('button', { name: 'Use sample photo: Reference image 10' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use dance template: Anime Character Dance' }));
    fireEvent.change(screen.getByLabelText('Choose local dance video'), { target: { files: [new File(['video'], 'local.mp4', { type: 'video/mp4' })] } }); jobs[0].resolve(7);
    await waitFor(() => expect(screen.getByLabelText('Local dance video preview')).toHaveAttribute('src', 'blob:1'));
    expect(screen.getByRole('button', { name: 'Use dance template: Anime Character Dance' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo' })); expect(screen.getByLabelText('Local dance video preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload photo/ })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Remove dance selection' })); expect(screen.queryByLabelText('Local dance video preview')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload video' })).toHaveFocus(); expect(screen.getByRole('button', { name: /Generate dance/ })).toBeDisabled();
  });
  it('文件输入替换、立即选模板，迟到文件失败不能撤销新模板', async () => {
    const { jobs } = fixture(); fireEvent.change(screen.getByLabelText('Choose local dance video'), { target: { files: [new File(['bad'], 'bad.mp4', { type: 'video/mp4' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Use dance template: Relaxed Sway Dance' })); jobs[0].reject(new Error('late'));
    await waitFor(() => expect(screen.queryByText('Reading the motion video…')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Use dance template: Relaxed Sway Dance' })).toHaveAttribute('aria-pressed', 'true');
  });
});
