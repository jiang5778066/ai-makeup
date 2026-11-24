import {createMediaStepDatabase} from './media-step-database';
import {createMediaStore} from './media-persistence';
import {getMediaRuntime,readMediaRuntimeConfig,databaseStepApprovalsValid} from './media-runtime';
import {createMediaProcessor} from './media-processor';
import {withMediaExecution,checkMediaExecution} from './media-execution';
import {validMediaStepSecret} from './media-step';
export function mediaDatabaseStepEnabled(){
 const c=readMediaRuntimeConfig(process.env);
 return process.env.MEDIA_STEP_ENABLED==='1'&&validMediaStepSecret(process.env.MEDIA_STEP_SECRET)&&c.executionBackend==='database-step'&&c.storageBackend==='supabase'&&databaseStepApprovalsValid(c)&&Boolean(c.executionApprovalRef)&&Date.parse(c.executionValidUntil??'')>Date.now();
}
export async function runMediaDatabaseStep(signal:AbortSignal):Promise<{processed:boolean}>{
 return withMediaExecution(signal,async()=>{
  checkMediaExecution();if(!mediaDatabaseStepEnabled())return {processed:false};
  const r=getMediaRuntime(),scoped=createMediaStepDatabase(signal),store=createMediaStore(scoped.database);
  try{
   if(!await store.ready())throw Error('media_schema_unavailable');checkMediaExecution();
   const task=await store.claimDue();if(!task)return {processed:false};
   const processed=await createMediaProcessor(store,r.providers,r.storage,{singleStep:true,signal})(task.id,task);
   return {processed};
  }finally{await scoped.close()}
 });
}
