import {it,expect,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import {initializeGenerator} from '@/lib/platform-generator-parameters';
import {PlatformVideoGeneratorForm} from './platform-video-generator-form';
vi.mock('@/lib/platform-account-session',()=>({usePlatformAccount:()=>({status:'signed_out',epoch:1}),getPlatformAccountEpoch:()=>1,expirePlatformAccount:vi.fn()}));
it('仅来源grok-imagine显式映射完整本站视频tuple，来源6秒/声音/比例仍独立预览',()=>{
 const state={...initializeGenerator('/ai-video-generator','model=grok-imagine&mode=text'),model:'grok-imagine',parameters:{duration:6,ratio:'16:9',sound:true,resolution:'720P'}};
 const view=render(<PlatformVideoGeneratorForm state={state} onChange={()=>{}} locale="zh-CN" onFiles={()=>{}}/>);expect(screen.getByText(/grok-imagine-video-1\.5/)).toBeInTheDocument();expect(screen.getByText(/1秒 · 480p/)).toBeInTheDocument();expect(screen.queryByRole('group',{name:'时长'})).not.toBeInTheDocument();expect(screen.queryByText('6s')).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'登录后生成'})).toBeInTheDocument();expect(screen.getByRole('button',{name:'获取报价'})).toBeDisabled();view.unmount();
 render(<PlatformVideoGeneratorForm state={{...state,model:'grok-imagine-video-1-5'}} onChange={()=>{}} locale="zh-CN" onFiles={()=>{}}/>);expect(screen.queryByText(/grok-imagine-video-1\.5/)).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'生成暂不可用'})).toBeDisabled();
});
