"use client";
import {useEffect,useState,useSyncExternalStore} from 'react';
import {usePlatformAccount} from '@/lib/platform-account-session';
import {MediaGenerationController,createMediaClient,type MediaDraft} from '@/lib/media-client';
export function useMediaGeneration(draft:MediaDraft,fetcher?:typeof fetch){
 const account=usePlatformAccount();
 const [controller]=useState(()=>{let storage:Storage|undefined;try{storage=typeof window!=='undefined'?window.sessionStorage:undefined}catch{/* 浏览器隐私策略可能禁用存储。 */}return new MediaGenerationController(createMediaClient(fetcher),storage)});
 const state=useSyncExternalStore(controller.subscribe,controller.snapshot,controller.snapshot);
 useEffect(()=>{controller.activate();return()=>controller.dispose()},[controller]);
 useEffect(()=>{controller.account(account.status==='signed_in'?account.user?.id??null:null,account.epoch);if(account.status==='signed_in')void controller.capabilities()},[controller,account.status,account.user?.id,account.epoch]);
 useEffect(()=>{controller.draft(draft)},[controller,draft]);
 useEffect(()=>{if(state.status==='pending')controller.poll()},[controller,state.status,state.task?.taskId]);
 return {state,controller,account};
}
