import {it,expect} from 'vitest';
import {POST} from './route';
it('匿名请求401且私有不缓存，不因目标ID泄露资源',async()=>{
 const request=new Request('https://app.invalid/api/media/test',{method:'POST'});
 const r=await POST(request,{params:Promise.resolve({id:'00000000-0000-4000-8000-000000000001'})});
 expect(r.status).toBe(401);expect(r.headers.get('cache-control')).toContain('no-store');expect(r.headers.get('vary')).toBe('Cookie');expect(await r.json()).toEqual({code:'unauthorized'});
});
