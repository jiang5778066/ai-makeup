import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlatformGhibliPage } from './platform-ghibli-page';
import { PlatformGhibliComparison } from './platform-ghibli-comparison';
import { ghibliMedia } from '@/lib/platform-ghibli-media';

vi.mock('./site-shell', () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe('吉卜力专页', () => {
  it.each(['en', 'zh-CN'] as const)('准确呈现 %s 独有正文与本地 CTA，不发明生成表单', locale => {
    const { container } = render(<PlatformGhibliPage locale={locale} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(locale === 'en' ? 'Turn Your Photo to Ghibli Style Art Online Free' : '免费在线将照片转为吉卜力风格艺术');
    expect(screen.getAllByRole('slider')).toHaveLength(7);
    expect(container.querySelectorAll('img')).toHaveLength(14);
    expect(container.querySelector('form,input[type="file"],textarea,select')).toBeNull();
    const links = [...container.querySelectorAll('a[data-ghibli-cta]')];
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute('href', `${locale === 'zh-CN' ? '/zh-CN' : ''}/image-style-converter`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(container.querySelectorAll('[data-ghibli-example]')).toHaveLength(6);
    expect(container.querySelector('[data-generation-availability]')).toHaveAttribute('data-generation-availability', 'unavailable');
  });

  it('对照图键盘操作只改变自身位置，端点保持在 0–100', () => {
    render(<PlatformGhibliComparison pair={ghibliMedia[0]} locale="zh-CN" name="首屏" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '55');
    fireEvent.keyDown(slider, { key: 'End' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    fireEvent.keyDown(slider, { key: 'Home' });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });
});
