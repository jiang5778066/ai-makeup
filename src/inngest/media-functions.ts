import {inngest} from './client';
import {mediaUuid} from '@/lib/media-contracts';
import {createMediaProcessor} from '@/lib/media-processor';
import {getMediaRuntime,readMediaRuntimeConfig} from '@/lib/media-runtime';
export {createMediaProcessor} from '@/lib/media-processor';
export const processMediaTask=async(id:string)=>{if(readMediaRuntimeConfig(process.env).executionBackend!=='inngest')return false;const r=getMediaRuntime();return createMediaProcessor(r.store,r.providers,r.storage)(id)};
const triggers=[{event:'media/generate.requested'},{event:'media/reconcile.requested'},{event:'media/store.requested'}];
export const mediaGenerate=inngest.createFunction({id:'media-generate',retries:2,triggers},async({event,step})=>{
 const data=event.data as {taskId?:unknown;operationId?:unknown};
 if(typeof data.taskId!=='string'||!mediaUuid.test(data.taskId)||typeof data.operationId!=='string'||!mediaUuid.test(data.operationId))return {ignored:true};
 await step.run('process-original-task',()=>processMediaTask(data.taskId as string));return {processed:true};
});
export const mediaScan=inngest.createFunction({id:'media-recovery-scan',retries:1,triggers:{cron:'*/2 * * * *'}},async({step})=>{
 if(readMediaRuntimeConfig(process.env).executionBackend!=='inngest')return {disabled:true};
 const store=getMediaRuntime().store;
 if(!await store.ready())return {unavailable:true};
 const task=await step.run('lease-one-due-task',()=>store.claimDue());
 if(task)await step.run('process-original-task',()=>{const r=getMediaRuntime();return createMediaProcessor(r.store,r.providers,r.storage)(task.id,task)});
 return {scheduled:task?1:0};
});
