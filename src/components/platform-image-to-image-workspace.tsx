'use client';
import {Suspense} from 'react';
import type {Locale} from '@/lib/i18n';
import {localizePath} from '@/lib/i18n';
import {usePlatformUrl} from './use-platform-url';
import {ImageToImageForm} from './platform-image-to-image-form';
import {imageToImageKey} from '@/lib/platform-image-to-image-state';
import styles from './platform-image-to-image-page.module.css';
function Workspace({locale,initialQuery}:{locale:Locale;initialQuery:string}){const path=localizePath('/tools/image-to-image-ai',locale),url=usePlatformUrl(`${path}${initialQuery?'?'+initialQuery:''}`),parsed=new URL(url,'https://local.invalid');return <div className={styles.workspace} id="generator">{parsed.pathname===path&&<ImageToImageForm key={`${locale}:${imageToImageKey(parsed.search)}`} locale={locale} query={parsed.search}/>}</div>;}
export function ImageToImageWorkspace(props:{locale:Locale;initialQuery:string}){return <Suspense fallback={<div id="generator" className={styles.workspace}>{props.locale==='zh-CN'?'正在准备本地预览…':'Preparing local preview…'}</div>}><Workspace {...props}/></Suspense>;}
