"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Upload,X,RefreshCw} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import {GeneratorUploadStore,decodeLocalPreview,type PreviewConfig} from '@/lib/platform-generator-upload';
export function PlatformGeneratorUpload({config,locale,label,onFiles,onReadyFiles,remoteConsentRequired}:{config:PreviewConfig;locale:Locale;label:string;onFiles:()=>void;onReadyFiles?:(files:File[],version:number)=>void;remoteConsentRequired?:boolean}){
 const zh=locale==='zh-CN';const input=useRef<HTMLInputElement>(null);const replaceId=useRef<number|null>(null);
 const [store]=useState(()=>new GeneratorUploadStore(config,{create:file=>URL.createObjectURL(file),revoke:url=>URL.revokeObjectURL(url),decode:decodeLocalPreview}));
 const slots=useSyncExternalStore(store.subscribe,store.snapshot,store.snapshot);
 const selectionVersion=useRef(0);
 useEffect(()=>{onReadyFiles?.(slots.every(s=>s.status==='ready')?slots.map(s=>s.file):[],++selectionVersion.current)},[slots,onReadyFiles]);
 useEffect(()=>{store.activate();return()=>store.dispose()},[store]);
 const accept=(files:File[])=>{if(replaceId.current!==null&&files[0])store.replace(replaceId.current,files[0]);else store.add(files);replaceId.current=null;if(files.length)onFiles();if(input.current)input.current.value=''};
 const errors:Record<string,string>=zh?{type:'文件格式不支持，请按所列格式重新选择。',size:'文件超过本地预览大小限制。',count:`最多选择${config.max}个文件。`,decode:'无法读取此文件，请选择有效的图片、视频或音频。'}:{type:'Unsupported file type. Choose one of the listed formats.',size:'This file exceeds the local preview size limit.',count:`Select at most ${config.max} files.`,decode:'Unable to read this file. Choose a valid image, video or audio file.'};
 return <div className="platform-generator-field platform-generator-upload"><div className="platform-generator-label"><span>{label}</span><span>{slots.length}/{config.max}</span></div>
 <div className="platform-generator-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();replaceId.current=null;accept([...e.dataTransfer.files])}}>
  <div className="platform-generator-upload-grid">{slots.map(slot=><div className="platform-generator-upload-slot" key={slot.id} data-preview-state={slot.status}>
   {slot.status==='ready'?(slot.file.type.startsWith('image/')?<img src={slot.url} alt={slot.file.name}/>:slot.file.type.startsWith('video/')?<video src={slot.url} controls preload="metadata"/>:<audio src={slot.url} controls preload="metadata"/>):<span role="status">{zh?'正在读取…':'Reading…'}</span> /* eslint-disable-line @next/next/no-img-element */}
   <small>{slot.file.name}</small><button type="button" aria-label={`${zh?'替换':'Replace'} ${slot.file.name}`} onClick={()=>{replaceId.current=slot.id;input.current?.click()}}><RefreshCw size={14}/></button><button type="button" aria-label={`${zh?'移除':'Remove'} ${slot.file.name}`} onClick={()=>store.remove(slot.id)}><X size={14}/></button>
  </div>)}{slots.length<config.max&&<button className="platform-generator-add" type="button" onClick={()=>{replaceId.current=null;input.current?.click()}}><Upload/><strong>{zh?'添加文件':'Add File'}</strong><small>{zh?'最大':'Max'} {config.maxBytes/1024/1024}MB</small></button>}</div>
  <input ref={input} aria-label={label} type="file" accept={config.accept} multiple={config.max>1} onChange={e=>accept([...e.currentTarget.files??[]])}/>
 </div><small className="platform-generator-hint">{remoteConsentRequired?(zh?'选择后先在本机预览；仅在同意本站参数并获取报价时上传。':'Files are previewed locally first and uploaded only after consent when requesting a site quote.'):config.localByteLimit?(zh?'本地预览限制，单文件最多10MB；不代表生成服务支持。':'Local preview limit: 10MB per file; this does not imply generation support.'):(zh?'文件仅在本机预览，不会上传。':'Files stay on this device and are not uploaded.')} {config.accept}</small>{store.error&&<p role="alert" className="platform-generator-error">{errors[store.error]}</p>}</div>;
}
