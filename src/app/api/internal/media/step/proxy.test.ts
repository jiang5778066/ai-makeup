// @vitest-environment node
import {NextRequest,NextResponse} from 'next/server';
import {expect,it,vi} from 'vitest';
const session=vi.hoisted(()=>vi.fn(async()=>({response:NextResponse.next(),user:null})));
vi.mock('@/lib/supabase/middleware',()=>({updateSession:session}));
import {proxy} from '@/proxy';
it('精确内部step由专用服务认证，相邻路径保持原保护',async()=>{const r=await proxy(new NextRequest('https://app.invalid/api/internal/media/step',{method:'POST'}));expect(r.status).toBe(200);expect(r.cookies.getAll()).toHaveLength(0);expect(session).not.toHaveBeenCalled();for(const path of ['/api/internal/media/step/child','/api/internal/media/step-other','/api/account/delete-data','/dashboard'])await proxy(new NextRequest('https://app.invalid'+path));expect(session).toHaveBeenCalledTimes(4)});
