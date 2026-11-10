'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Upload,RefreshCw,X} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import {ImageToImageUploadStore,decodeLocalPreview,type PreviewConfig} from '@/lib/platform-image-to-image-upload';
import styles from './platform-image-to-image-page.module.css';
export function ImageToImageUpload({config,locale,onFiles}:{config:PreviewConfig;locale:Locale;onFiles:(hasFiles:boolean)=>void}){
 const zh=locale==='zh-CN',input=useRef<HTMLInputElement>(null),replacement=useRef<number|null>(null);
 const [store]=useState(()=>new ImageToImageUploadStore(config,{create:file=>URL.createObjectURL(file),revoke:url=>URL.revokeObjectURL(url),decode:decodeLocalPreview}));
 const slots=useSyncExternalStore(store.subscribe,store.snapshot,store.snapshot);
 useEffect(()=>{store.activate();const node=input.current;const cancel=()=>{replacement.current=null;};node?.addEventListener('cancel',cancel);return()=>{node?.removeEventListener('cancel',cancel);store.dispose();};},[store]);
 useEffect(()=>{onFiles(slots.length>0);},[slots,onFiles]);
 const accept=(files:File[])=>{if(replacement.current!==null&&files[0])store.replace(replacement.current,files[0]);else store.add(files);replacement.current=null;if(input.current)input.current.value='';};
 const byteLimit=`${config.maxBytes/(1024*1024)}MB`;
 const errors:Record<string,string>=zh?{type:'文件格式不支持，请选择图片。',size:`文件超过${byteLimit}限制。`,count:`最多选择${config.max}张参考图片。`,decode:'无法解码此图片，请重新选择有效图片。'}:{type:'Unsupported file type. Please choose an image.',size:`This file exceeds the ${byteLimit} limit.`,count:`Choose at most ${config.max} reference images.`,decode:'This image could not be decoded. Please choose a valid image.'};
 return <div className={styles['platform-upload']}><div className={styles['platform-label']}><span>{zh?'参考图片':'Reference Images'}</span><span>{slots.length}/{config.max}</span></div>
 <div className={styles['platform-drop']} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();replacement.current=null;accept([...e.dataTransfer.files]);}}>
 {slots.map(slot=><div className={styles['platform-slot']} key={slot.id} data-preview-state={slot.status}>
 {slot.status==='ready'?<img src={slot.url} alt={slot.file.name}/>:<span role="status">{zh?'正在读取…':'Reading…'}</span> /* eslint-disable-line @next/next/no-img-element */}
 <small>{slot.file.name}</small><div><button type="button" aria-label={`${zh?'替换':'Replace'} ${slot.file.name}`} onClick={()=>{replacement.current=slot.id;input.current?.click();}}><RefreshCw size={16}/></button><button type="button" aria-label={`${zh?'移除':'Remove'} ${slot.file.name}`} onClick={()=>store.remove(slot.id)}><X size={16}/></button></div></div>)}
 {slots.length<config.max&&<button type="button" className={styles['platform-add']} onClick={()=>{replacement.current=null;input.current?.click();}}><span><Upload size={24}/></span><strong>{zh?'添加图片':'Add Image'}</strong><small>{zh?`最大 ${byteLimit}`:`Max ${byteLimit}`}</small></button>}
 <input ref={input} aria-label={zh?'选择本地参考图片':'Choose local reference images'} type="file" accept={config.accept} multiple={config.max>1} onChange={e=>accept([...e.currentTarget.files??[]])}/></div>
 <p className={styles['platform-hint']}>{zh?'文件仅在本机预览，不会上传。':'Files stay on this device and are not uploaded.'}{config.localByteLimit&&(zh?` ${byteLimit}为本地预览保护限制。`:` ${byteLimit} is a local preview protection limit.`)}</p>{store.error&&<p role="alert" className={styles['platform-error']}>{errors[store.error]}</p>}</div>;
}
