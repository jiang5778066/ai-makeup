import {it,expect} from 'vitest';
import {createMediaHandlers} from './media-tasks';
import {closedMediaCatalog} from './media-catalog';
import {createMediaStore} from './media-persistence';
import {vi} from 'vitest';
const request=()=>new Request('https://app.example/api/media/capabilities');
it('默认能力不可用且私有缓存，匿名与依赖错误分别401/503',async()=>{
 const handlers=createMediaHandlers({currentUser:async()=>({id:'synthetic'}),catalog:closedMediaCatalog,store:{ready:async()=>true} as never,limit:()=>true,emit:async()=>{}});
 const response=await handlers.capabilities(request());expect(response.status).toBe(503);expect(response.headers.get('vary')).toBe('Cookie');expect(response.headers.get('cache-control')).toContain('no-store');expect((await response.json()).capabilities.every((v:{enabled:boolean})=>!v.enabled)).toBe(true);
 const anonymous=createMediaHandlers({currentUser:async()=>null,catalog:closedMediaCatalog,store:{} as never,limit:()=>true,emit:async()=>{}});expect((await anonymous.capabilities(request())).status).toBe(401);
});
it('缺表与数据库不可观测分别返回去密503，不能执行写事务或投递',async()=>{
 for(const fault of [null,'permission denied: secret SQL','connection refused: secret password','unexpected SQL failure']){
  const transaction=vi.fn(async()=>{throw Error('不可执行写事务')}),emit=vi.fn();
  const store=createMediaStore({execute:async()=>{if(fault)throw Error(fault);return [{ready:false}]},transaction});
  const h=createMediaHandlers({currentUser:async()=>({id:'synthetic'}),catalog:closedMediaCatalog,store,limit:()=>true,emit});
  const response=await h.capabilities(request()),body=await response.text();
  expect(response.status).toBe(503);expect(JSON.parse(body).code).toBe(fault?'media_unavailable':'media_schema_unavailable');
  expect(body).not.toMatch(/secret|password|SQL|permission|connection/);expect(transaction).not.toHaveBeenCalled();expect(emit).not.toHaveBeenCalled();
 }
});
