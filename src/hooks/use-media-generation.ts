"use client";
import {useEffect,useLayoutEffect,useState,useSyncExternalStore} from 'react';
import {expirePlatformAccount,getPlatformAccountEpoch,usePlatformAccount} from '@/lib/platform-account-session';
import {MediaGenerationController,createMediaClient,type MediaDraft} from '@/lib/media-client';
import {browserMediaRecoveryStorage} from '@/lib/media-recovery-storage';

export function useMediaGeneration(draft:MediaDraft,fetcher?:typeof fetch){
 const account=usePlatformAccount();
 const [controller]=useState(()=>new MediaGenerationController(createMediaClient(fetcher),
  typeof window==='undefined'?undefined:browserMediaRecoveryStorage,getPlatformAccountEpoch,expirePlatformAccount));
 const state=useSyncExternalStore(controller.subscribe,controller.snapshot,controller.snapshot);
 const accountId=account.status==='signed_in'?account.user?.id??null:null;
 const verifying=account.status==='loading'||account.status==='error';
 const accountReady=Boolean(accountId)&&controller.matchesAccount(accountId,account.epoch);
 const visibleState=accountReady?state:controller.snapshotFor(accountId,account.epoch);
 useLayoutEffect(()=>{controller.activate();return()=>controller.dispose()},[controller]);
 useLayoutEffect(()=>{controller.account(accountId,account.epoch,verifying);if(accountId)void controller.capabilities()},[controller,accountId,verifying,account.epoch]);
 useLayoutEffect(()=>{controller.draft(draft)},[controller,draft]);
 useEffect(()=>{if(visibleState.status==='pending')controller.poll()},[controller,visibleState.status,visibleState.task?.taskId]);
 return {state:visibleState,controller,account,accountReady};
}
