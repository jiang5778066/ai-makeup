// @vitest-environment node
import {expect,it,vi} from 'vitest';
import sharp from 'sharp';
const lifecycle=vi.hoisted(()=>({killed:false,closed:false}));
vi.mock('node:child_process',async importOriginal=>{const actual=await importOriginal<typeof import('node:child_process')>();return {...actual,spawn:(...args:Parameters<typeof actual.spawn>)=>{const child=actual.spawn(...args),kill=child.kill.bind(child);child.kill=signal=>{lifecycle.killed=true;return kill(signal)};child.once('close',()=>{lifecycle.closed=true});return child}}});
import {createSharpMediaDecoder} from './media-decoder';
import {withMediaExecution} from './media-execution';
it('step abort真实sharp子进程SIGKILL并等待close，之后槽可复用',async()=>{
 const bytes=await sharp({create:{width:16,height:24,channels:3,background:'white'}}).png().toBuffer();
 const c=new AbortController(),decode=createSharpMediaDecoder({maxConcurrent:1});const pending=withMediaExecution(c.signal,()=>decode(bytes,'image/png'));const rejection=expect(pending).rejects.toThrow();c.abort();await rejection;expect(lifecycle.killed).toBe(true);expect(lifecycle.closed).toBe(true);expect(await decode(bytes,'image/png')).toHaveProperty('width',16);
});
