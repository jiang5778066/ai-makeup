'use client';
/* eslint-disable @next/next/no-img-element */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {ImagePlus,Trash2,RefreshCw} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import {AlbumPreviewStore,decodeAlbumImage,type AlbumPreviewConfig} from '@/lib/platform-album-cover-upload';
import styles from './platform-album-cover-page.module.css';
export function AlbumUpload({config,locale}:{config:AlbumPreviewConfig;locale:Locale}){
 const zh=locale==='zh-CN',input=useRef<HTMLInputElement>(null),replaceId=useRef<number|undefined>(undefined);
 const [store]=useState(()=>new AlbumPreviewStore(config,{create:file=>URL.createObjectURL(file),revoke:url=>URL.revokeObjectURL(url),decode:decodeAlbumImage}));
 const view=useSyncExternalStore(store.subscribe,store.snapshot,store.snapshot);
 useEffect(()=>{store.activate();return()=>store.dispose()},[store]);
 const choose=(id?:number)=>{if(view.busy)return;replaceId.current=id;input.current?.click()};
 const errors:Record<string,string>=zh?{type:'文件类型不支持，原预览已保留。',size:'文件超过本地大小限制，原预览已保留。',count:'已达到此模型的参考图片数量上限。',decode:'图片无法解码，原预览已保留。'}:{type:'Unsupported file type. Existing previews were kept.',size:'File exceeds the local size limit. Existing previews were kept.',count:'Reference image limit reached for this model.',decode:'Image could not be decoded. Existing previews were kept.'};
 return <div className={styles.upload}><div className={styles.uploadTitle}>{zh?'参考图片':'Reference Images'}<span>{view.slots.length}/{config.max}</span></div><div className={styles.drop}>
 <input aria-label={zh?'选择本地参考图片':'Choose local reference image'} ref={input} type="file" accept={config.accept} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file)return;if(replaceId.current!==undefined)store.replace(replaceId.current,file);else store.add([file]);replaceId.current=undefined}}/>
 {view.slots.map(slot=><article key={slot.id} className={styles.slot}><img src={slot.url} alt={slot.file.name}/><small>{slot.file.name}</small><div><button type="button" disabled={view.busy} onClick={()=>choose(slot.id)} aria-label={`${zh?'替换':'Replace'} ${slot.file.name}`}><RefreshCw size={14}/></button><button type="button" onClick={()=>store.remove(slot.id)} aria-label={`${zh?'移除':'Remove'} ${slot.file.name}`}><Trash2 size={14}/></button></div></article>)}
 {view.slots.length<config.max&&<button className={styles.add} type="button" disabled={view.busy} onClick={()=>choose()}><ImagePlus size={26}/><strong>{zh?'添加图片':'Add Image'}</strong><small>{zh?'本地最大':'Local max'} {config.maxBytes/1024/1024}MB</small></button>}
 </div>{view.busy&&<p role="status" className={styles.hint}>{zh?'正在解码，请等待后再替换或添加。':'Decoding image. Please wait before replacing or adding.'}</p>}{view.error&&<p role="alert" className={styles.error}>{errors[view.error]}</p>}</div>;
}
