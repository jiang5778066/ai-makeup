import {AsyncLocalStorage} from 'node:async_hooks';
const context=new AsyncLocalStorage<AbortSignal>();
export const mediaExecutionSignal=()=>context.getStore();
export const checkMediaExecution=()=>mediaExecutionSignal()?.throwIfAborted();
export const withMediaExecution=<T>(signal:AbortSignal,run:()=>Promise<T>)=>context.run(signal,run);
/** 传播同一请求截止，保留底层操作自己的更短超时；不以Promise.race留下悬空I/O。 */
export const boundedMediaFetch=(nativeFetch:typeof fetch):typeof fetch=>async(raw,init)=>{
 checkMediaExecution();const signals=[mediaExecutionSignal(),init?.signal,raw instanceof Request?raw.signal:undefined].filter((v):v is AbortSignal=>Boolean(v));
 return nativeFetch(raw,{...init,signal:signals.length?AbortSignal.any(signals):undefined});
};
