import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformIceditSession } from './platform-icedit-session';
vi.mock('./platform-icedit-upload', () => ({ PlatformIceditUpload: () => <div data-testid="upload"/> }));
afterEach(cleanup);
describe('ICEdit 本地表单', () => {
  it('示例填入完整提示词，输入保持可编辑且不可提交生成', () => {
    render(<PlatformIceditSession locale="en" query="test=prompt"/>);
    fireEvent.click(screen.getByRole('button', { name: '⚫ Convert to dramatic black and white' }));
    expect(screen.getByRole('textbox')).toHaveValue('Convert to dramatic black and white');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'custom vision' } });
    expect(screen.getByRole('textbox')).toHaveValue('custom vision');
    expect(screen.getByRole('button', { name: /Edit Image/ })).toBeDisabled();
    expect(screen.getAllByTestId('upload')).toHaveLength(1);
  });
  it.each(['gpt-image-2', 'not-a-real-model'])('未知或其它页模型 %s 不显示上传，主动恢复后才显示', model => {
    render(<PlatformIceditSession locale="zh-CN" query={`model=${model}`}/>);
    expect(screen.queryByTestId('upload')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(model);
    fireEvent.click(screen.getByRole('button', { name: '选择 ICEdit 单图编辑' }));
    expect(screen.getByTestId('upload')).toBeInTheDocument();
  });
});
