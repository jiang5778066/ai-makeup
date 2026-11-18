import {timingSafeEqual} from 'node:crypto';
export const MEDIA_STEP_MAX_DURATION=120;
export const MEDIA_STEP_DEADLINE_MS=85000;
export const MEDIA_STEP_LEASE_SECONDS=150;
export const validMediaStepSecret=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64,128}$/.test(v)&&v.length%2===0;
type Dependencies={secret:()=>string|undefined;enabled:()=>boolean;tick:(signal:AbortSignal)=>Promise<{processed:boolean}>};
const json=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
/** 仅专用服务身份，可扫描一个due任务；不接受用户指定的执行内容。 */
export function createMediaStepHandler(deps:Dependencies){return async(request:Request)=>{
 if(request.method!=='POST')return json({code:'method_not_allowed'},405);
 const secret=deps.secret();if(!validMediaStepSecret(secret))return json({code:'media_step_unconfigured'},503);
 const actual=request.headers.get('authorization')??'',expected=`Bearer ${secret}`;
 if(Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return json({code:'unauthorized'},401);
 if(new URL(request.url).search)return json({code:'invalid_step_request'},400);
 if(!deps.enabled())return json({code:'media_step_unavailable'},503);
 const controller=new AbortController(),abort=()=>controller.abort();const timer=setTimeout(abort,MEDIA_STEP_DEADLINE_MS);
 request.signal.addEventListener('abort',abort,{once:true});if(request.signal.aborted)abort();
 try{controller.signal.throwIfAborted();if(!await fixedStepBody(request,controller.signal))return json({code:'invalid_step_request'},400);controller.signal.throwIfAborted();const r=await deps.tick(controller.signal);controller.signal.throwIfAborted();return json({processed:r.processed===true})}
 catch{return json({code:controller.signal.aborted?'media_step_aborted':'media_step_unavailable'},503)}
 finally{clearTimeout(timer);request.signal.removeEventListener('abort',abort)}
 }}

async function fixedStepBody(request:Request,signal:AbortSignal){
 if(!request.body)return true;const reader=request.body.getReader();let size=0;const chunks:Uint8Array[]=[];
 let cancellation:Promise<void>|undefined;const cancel=()=>cancellation??=reader.cancel().catch(()=>{});
 const abort=()=>{cancel()};signal.addEventListener('abort',abort,{once:true});
 try{
  while(true){signal.throwIfAborted();const next=await reader.read();signal.throwIfAborted();if(next.done)break;size+=next.value.length;if(size>2)return false;chunks.push(next.value)}
  return Buffer.concat(chunks).toString('utf8')==='{}';
 }finally{signal.removeEventListener('abort',abort);await cancel();reader.releaseLock()}
}
