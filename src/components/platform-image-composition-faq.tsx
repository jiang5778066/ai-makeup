'use client';
import {useState} from 'react';
import {ChevronDown,CircleHelp} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import styles from './platform-image-composition-page.module.css';
export function CompositionFaq({items,locale}:{items:readonly {title:string;body?:string}[];locale:Locale}){
 const [open,setOpen]=useState<number[]>([]);
 return <div className={styles['platform-faq']}>{items.map((item,i)=><article key={item.title}><h3><button type="button" aria-expanded={open.includes(i)} aria-controls={`platform-composition-faq-${i}`} id={`platform-composition-question-${i}`} onClick={()=>setOpen(current=>current.includes(i)?current.filter(n=>n!==i):[...current,i])}><span><CircleHelp size={18}/></span>{item.title}<ChevronDown size={16}/></button></h3><div id={`platform-composition-faq-${i}`} role="region" aria-labelledby={`platform-composition-question-${i}`} hidden={!open.includes(i)}><small>{locale==='zh-CN'?'Lanta AI公开参照回答；本站生成暂不可用。':'Public Lanta AI reference answer; generation is unavailable here.'}</small><p>{item.body}</p></div></article>)}</div>;
}
