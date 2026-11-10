"use client";
import {useEffect,useRef,useState} from 'react';
import {Box,ChevronDown,Search} from 'lucide-react';
import type {Locale} from '@/lib/i18n';
import type {GeneratorModel} from '@/lib/platform-generator-data';

// 只从当前模式传入的可选集合取推荐，避免推荐入口绕过模式限制。
const recommendedIds=['lanta-2-1','wan-3-0','wan-2-2-spicy','kling-4-0','grok-imagine-video-1-5','seedance-2-0','minimax-h3'];
export function PlatformGeneratorModelPicker({models,value,onChange,locale,searchable=false,emptyLabel}:{models:GeneratorModel[];value:string;onChange:(id:string)=>void;locale:Locale;searchable?:boolean;emptyLabel?:string}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState('');
 const button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const zh=locale==='zh-CN',selected=models.find(m=>m.id===value);
 const query=search.trim().toLowerCase(),filtered=models.filter(m=>m.name.toLowerCase().includes(query));
 const recommended=searchable&&!query?recommendedIds.flatMap(id=>models.find(m=>m.id===id)??[]):[];
 const recommendedLabel=zh?'推荐模型':'Recommended models',allLabel=zh?'全部模型':'All models';
 useEffect(()=>{
  if(!open)return;
  const outside=(e:PointerEvent)=>{if(!panel.current?.contains(e.target as Node)&&!button.current?.contains(e.target as Node)){setOpen(false);setSearch('')}};
  document.addEventListener('pointerdown',outside);panel.current?.querySelector<HTMLElement>('input,button')?.focus();
  return()=>document.removeEventListener('pointerdown',outside);
 },[open]);
 const close=()=>{setOpen(false);setSearch('');button.current?.focus()};
 const option=(m:GeneratorModel)=><button type="button" role={searchable?undefined:'option'} aria-selected={searchable?undefined:value===m.id} aria-pressed={searchable?value===m.id:undefined} data-model={m.id} data-selected={value===m.id} key={m.id} onClick={()=>{onChange(m.id);close()}}><Box size={16}/><span>{m.name}</span>{value===m.id&&'✓'}</button>;
 const brands=Object.entries(filtered.reduce<Record<string,GeneratorModel[]>>((groups,m)=>{const key=searchable?m.brand:'';(groups[key]??=[]).push(m);return groups},{}));
 return <div className="platform-generator-field platform-generator-picker">
  <label id="platform-generator-model-label">{zh?'模型':'Model'}</label>
  <button type="button" id="platform-generator-model-trigger" className="platform-generator-model-trigger" ref={button} aria-labelledby="platform-generator-model-label" aria-haspopup={searchable?'dialog':'listbox'} aria-expanded={open} onClick={()=>{setOpen(!open);setSearch('')}}><Box size={18}/><span>{selected?.name??(value===''&&emptyLabel?emptyLabel:`${zh?'不支持的模型':'Unsupported model'}: ${value}`)}</span><ChevronDown size={16}/></button>
  {open&&<div ref={panel} className="platform-generator-model-panel" role={searchable?'dialog':'listbox'} aria-label={zh?'选择模型':'Choose model'} onKeyDown={e=>{
   if(e.key==='Escape'){e.preventDefault();close()}
   if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
    const options=[...e.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
    if(!options.length)return;
    const i=options.indexOf(document.activeElement as HTMLButtonElement),n=e.key==='Home'?0:e.key==='End'?options.length-1:i<0?(e.key==='ArrowDown'?0:options.length-1):(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;
    options[n]?.focus();e.preventDefault();
   }
  }}>
   {searchable&&<div className="platform-generator-search"><Search size={16}/><input aria-label={zh?'搜索模型':'Search models'} placeholder={zh?'搜索模型…':'Search models…'} value={search} onChange={e=>setSearch(e.target.value)}/></div>}
   {!!recommended.length&&<div role="group" aria-label={recommendedLabel} className="platform-generator-recommended"><h3>{recommendedLabel}</h3>{recommended.map(option)}</div>}
   {!filtered.length?<p role="status">{zh?'未找到模型':'No models found'}</p>:<div role={searchable?'group':undefined} aria-label={searchable?allLabel:undefined}>
    {searchable&&<h3 className="platform-generator-model-group-title">{allLabel}</h3>}
    {brands.map(([brand,items])=><div key={brand}>{brand&&<h4>{brand}</h4>}{items.map(option)}</div>)}
   </div>}
  </div>}
 </div>;
}
