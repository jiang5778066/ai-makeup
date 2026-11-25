import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {AuthApiError,AuthSessionMissingError} from '@supabase/supabase-js';
import {GET} from './route';
import {POST} from '../route';
import {POST as quote} from '../../quotes/route';
import {GET as capabilities} from '../../capabilities/route';
import {POST as createInput} from '../../inputs/sign/route';
import {POST as completeInput} from '../../inputs/[id]/complete/route';
import {POST as signInput} from '../../inputs/[id]/sign/route';

const {cookies,createServerClient,runtime}=vi.hoisted(()=>({cookies:vi.fn(),createServerClient:vi.fn(),runtime:vi.fn()}));
vi.mock('next/headers',()=>({cookies}));
vi.mock('@supabase/ssr',()=>({createServerClient}));
vi.mock('@/lib/media-runtime',()=>({getMediaRuntime:runtime}));

const id='00000000-0000-4000-8000-000000000001';
const chunk='sb-fixture-auth-token.0';
const origin='https://app.invalid';
const params=()=>({params:Promise.resolve({id})});

beforeEach(()=>{vi.resetAllMocks();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','')});
afterEach(()=>vi.unstubAllEnvs());

function authFixture(error: unknown) {
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','http://127.0.0.1:9');
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','fixture');
 const set=vi.fn();
 cookies.mockResolvedValue({getAll:()=>[{name:chunk,value:'original'}],set});
 createServerClient.mockImplementation((_url,_key,options)=>({
  auth:{getUser:async()=>{
   await options.cookies.setAll([{name:chunk,value:'',options:{path:'/',maxAge:0}}],{});
   return {data:{user:null},error};
  }},
 }));
 return set;
}

it('匿名请求401且私有不缓存，不因目标ID泄露资源',async()=>{
 const request=new Request('https://app.invalid/api/media/test',{method:'GET'});
 const r=await GET(request,{params:Promise.resolve({id:'00000000-0000-4000-8000-000000000001'})});
 expect(r.status).toBe(401);expect(r.headers.get('cache-control')).toContain('no-store');expect(r.headers.get('vary')).toBe('Cookie');expect(await r.json()).toEqual({code:'unauthorized'});
});

it.each([429,503])('临时认证错误 %i 时，各媒体读写路由返回私有 503，并保留 Cookie',async status=>{
 const set=authFixture(new AuthApiError('fixture',status,undefined));
 const post=(path: string)=>new Request(origin+path,{method:'POST',headers:{Origin:origin}});
 const responses=await Promise.all([
  GET(new Request(origin+'/api/media/tasks/'+id),params()),
  capabilities(new Request(origin+'/api/media/capabilities')),
  POST(post('/api/media/tasks')),
  quote(post('/api/media/quotes')),
  createInput(post('/api/media/inputs/sign')),
  completeInput(post('/api/media/inputs/'+id+'/complete'),params()),
  signInput(post('/api/media/inputs/'+id+'/sign'),params()),
 ]);
 for(const response of responses){
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({code:'account_unavailable'});
  expect(response.headers.get('cache-control')).toMatch(/private.*no-store/);
  expect(response.headers.get('vary')).toBe('Cookie');
 }
 expect(set).not.toHaveBeenCalled();
 expect(runtime).not.toHaveBeenCalled();
});

it('明确失效走 401 并提交 Cookie 删除',async()=>{
 const set=authFixture(new AuthSessionMissingError());
 const response=await GET(new Request(origin+'/api/media/tasks/'+id),params());
 expect(response.status).toBe(401);
 expect(await response.json()).toEqual({code:'unauthorized'});
 expect(set).toHaveBeenCalledExactlyOnceWith(chunk,'',{path:'/',maxAge:0});
 expect(runtime).not.toHaveBeenCalled();
});
