import {it,expect} from 'vitest';
import {assertMediaUrl,publicMediaAddress,readBounded,sniffMediaMime} from './media-security';
it('阻断任意URL、重定向入口、私网与伪装MIME',()=>{
 for(const value of ['http://cdn.example/a','https://cdn.example:444/a','https://u:p@cdn.example/a','https://evil.example/a','https://127.0.0.1/a'])expect(()=>assertMediaUrl(value,['cdn.example'])).toThrow();
 expect(assertMediaUrl('https://cdn.example/a',['cdn.example']).hostname).toBe('cdn.example');
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','192.168.1.1','::1','::ffff:127.0.0.1','fe80::1','fc00::1'])expect(publicMediaAddress(ip)).toBe(false);
 expect(publicMediaAddress('8.8.8.8')).toBe(true);expect(sniffMediaMime(Buffer.from('<svg/>'))).toBeNull();
});
it('按真实流量限大小，不能靠Content-Length',async()=>{async function* body(){yield Buffer.alloc(5);yield Buffer.alloc(5)}await expect(readBounded(body(),8)).rejects.toThrow('media_too_large')});
import {createMediaDownloader} from './media-security';
it('CDN解析含私网就拒绝，不请求；固定解析连接且3xx不跟随',async()=>{
 let calls=0;const downloader=createMediaDownloader(['cdn.example'],{async resolve(){return [{address:'8.8.8.8',family:4},{address:'10.0.0.1',family:4}]},async request(){calls++;throw Error('不可调用')}});
 await expect(downloader('https://cdn.example/result',1024)).rejects.toThrow('unsafe_media_address');expect(calls).toBe(0);
 const redirect=createMediaDownloader(['cdn.example'],{async resolve(){return [{address:'8.8.8.8',family:4}]},async request(_url,address){expect(address.address).toBe('8.8.8.8');calls++;return {status:302,contentType:'image/png',body:(async function*(){yield Buffer.alloc(1)})()}}});
 await expect(redirect('https://cdn.example/result',1024)).rejects.toThrow('media_download_rejected');expect(calls).toBe(1);
});
