import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
const location=vi.hoisted(()=>({url:'/image-effects/ai-album-cover-generator?workspace=one'}));
vi.mock('./use-platform-url',()=>({usePlatformUrl:()=>location.url}));
import {AlbumReactiveForm} from './platform-album-cover-workspace';
afterEach(cleanup);
describe('同文档URL提交边界',()=>{
 it('重复query后值变化会卸载旧状态，不沿用合法文件配置',()=>{location.url='/image-effects/ai-album-cover-generator?workspace=one&mode=image-to-image';const {rerender}=render(<AlbumReactiveForm locale="en" query=""/>);fireEvent.change(screen.getByLabelText('Prompt'),{target:{value:'原文字'}});expect(document.querySelector('input[type=file]')).not.toBeNull();location.url='/image-effects/ai-album-cover-generator?workspace=one&mode=image-to-image&model=2403&model=bad';rerender(<AlbumReactiveForm locale="en" query=""/>);expect(document.querySelector('input[type=file]')).toBeNull();expect(screen.getByRole('alert')).toBeVisible()});
 it('URL语言先于旧props提交时立即释放旧form，不能挂着旧文件区',()=>{location.url='/image-effects/ai-album-cover-generator?workspace=two&mode=image-to-image';const {rerender}=render(<AlbumReactiveForm locale="en" query=""/>);expect(document.querySelector('input[type=file]')).not.toBeNull();location.url='/zh-CN/image-effects/ai-album-cover-generator?workspace=two&mode=image-to-image';rerender(<AlbumReactiveForm locale="en" query=""/>);expect(document.querySelector('form')).toBeNull();rerender(<AlbumReactiveForm locale="zh-CN" query=""/>);expect(screen.getByLabelText('提示词')).toBeVisible()});
});
