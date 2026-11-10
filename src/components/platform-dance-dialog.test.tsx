import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ usePathname: () => '/ai-dance', useSearchParams: () => new URLSearchParams(), useRouter: () => ({}) }));
vi.mock('./site-shell', () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('./platform-dance-video', () => ({ DanceVideo: () => <div /> }));
import { TemplatePreview } from './platform-dance-page';
beforeEach(() => {
  // jsdom 不实现模态 inert；这里只验证原生关闭与选择回调的顺序，焦点恢复另有真实浏览器证据。
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, writable: true, value() { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, writable: true, value() { this.open = false; } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('StrictMode 重挂副作用不能让原生弹窗发出伪关闭并移除预览', async () => {
  const close = vi.fn();
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); });
  render(<StrictMode><TemplatePreview id={1} locale="en" selected={false} select={vi.fn()} close={close} trigger={null} /></StrictMode>);
  await act(async () => { await Promise.resolve(); });
  expect(close).not.toHaveBeenCalled(); expect(document.querySelector('dialog')).toHaveAttribute('open');
});
it.each(['en', 'zh-CN'] as const)('%s 选用必须先解除原生模态，再交接选择和焦点，最后通知卸载', locale => {
  const calls: string[] = [], close = vi.fn(() => { calls.push('unmount'); });
  const nativeClose = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.open = false; calls.push('native-close'); });
  const select = vi.fn(() => { calls.push(document.querySelector('dialog')?.open ? 'select-while-modal' : 'select-and-focus'); });
  render(<TemplatePreview id={1} locale={locale} selected={false} select={select} close={close} trigger={null} />);
  fireEvent.click(document.querySelector('dialog button[aria-pressed]')!);
  expect(nativeClose).toHaveBeenCalledOnce(); expect(select).toHaveBeenCalledExactlyOnceWith(1, true); expect(close).toHaveBeenCalledOnce();
  expect(calls).toEqual(['native-close', 'select-and-focus', 'unmount']);
  // 原生 close 事件排队送达或重复点击不能再次选用、关闭或抢焦点。
  fireEvent(document.querySelector('dialog')!, new Event('close'));
  fireEvent.click(document.querySelector('dialog button[aria-pressed]')!);
  expect(select).toHaveBeenCalledOnce(); expect(close).toHaveBeenCalledOnce();
});
it.each(['escape', 'button', 'backdrop'] as const)('%s 取消保持选择并回到触发器，延后 close 不重复回焦', method => {
  const trigger = document.createElement('button'); document.body.append(trigger);
  const focus = vi.spyOn(trigger, 'focus'), close = vi.fn(), select = vi.fn();
  const view = render(<TemplatePreview id={1} locale="en" selected={false} select={select} close={close} trigger={trigger} />);
  const dialog = document.querySelector('dialog')!;
  if (method === 'escape') fireEvent(dialog, new Event('cancel', { cancelable: true }));
  else fireEvent.click(method === 'button' ? dialog.querySelector('button[aria-label="Close preview"]')! : dialog);
  expect(dialog.open).toBe(false); expect(close).toHaveBeenCalledOnce(); expect(select).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(trigger); expect(focus).toHaveBeenCalledOnce();
  const next = document.createElement('button'); document.body.append(next); next.focus();
  fireEvent(dialog, new Event('close')); view.unmount();
  expect(document.activeElement).toBe(next); expect(close).toHaveBeenCalledOnce();
  trigger.remove(); next.remove();
});
it('旧预览卸载与延后 close 不能关闭立即重开的预览或抢其焦点', () => {
  const trigger = document.createElement('button'); document.body.append(trigger);
  const oldClose = vi.fn(), nextClose = vi.fn();
  const view = render(<TemplatePreview key="old" id={1} locale="en" selected={false} select={vi.fn()} close={oldClose} trigger={trigger} />);
  const oldDialog = document.querySelector('dialog')!;
  fireEvent.click(oldDialog.querySelector('button[aria-pressed]')!);
  view.rerender(<TemplatePreview key="new" id={2} locale="en" selected={false} select={vi.fn()} close={nextClose} trigger={trigger} />);
  const nextDialog = document.querySelector('dialog')!, nextButton = nextDialog.querySelector('button')!;
  nextButton.focus(); fireEvent(oldDialog, new Event('close'));
  expect(nextDialog.open).toBe(true); expect(document.activeElement).toBe(nextButton);
  expect(oldClose).toHaveBeenCalledOnce(); expect(nextClose).not.toHaveBeenCalled();
  view.unmount(); expect(document.activeElement).not.toBe(trigger); trigger.remove();
});
