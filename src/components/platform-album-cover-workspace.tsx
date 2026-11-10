'use client';
import {Suspense} from 'react';
import {localizePath,type Locale} from '@/lib/i18n';
import {usePlatformUrl} from './use-platform-url';
import {AlbumForm} from './platform-album-cover-form';
function ReactiveForm({locale,query}:{locale:Locale;query:string}){
 const path=localizePath('/image-effects/ai-album-cover-generator',locale),location=usePlatformUrl(`${path}${query?'?'+query:''}`),url=new URL(location,'https://local.invalid');
 // URL先提交而语言props尚未提交时立刻卸载旧表单，确保在途文件失去归属。
 return url.pathname===path?<AlbumForm locale={locale} query={url.search}/>:<p role="status">{locale==='zh-CN'?'正在切换本地预览…':'Switching local preview…'}</p>;
}
export function AlbumReactiveForm(props:{locale:Locale;query:string}){return <Suspense fallback={<AlbumForm {...props}/>}><ReactiveForm {...props}/></Suspense>}
