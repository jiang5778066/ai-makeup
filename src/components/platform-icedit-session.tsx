'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';
import { generatorSelectionKey, generatorSessions } from '@/lib/platform-generator-session';
import { icedItConfig, iceditPath, iceditPrompts, initializeIcedit, restoreIcedit, selectIcedit } from '@/lib/platform-icedit-data';
import type { GeneratorState } from '@/lib/platform-generator-parameters';
import type { Locale } from '@/lib/i18n';
import { PlatformIceditUpload } from './platform-icedit-upload';
import styles from './platform-icedit-page.module.css';

export function PlatformIceditSession({ locale, query }: { locale: Locale; query: string }) {
  const zh = locale === 'zh-CN', key = generatorSelectionKey(iceditPath, query);
  const [initial] = useState(() => initializeIcedit(query));
  const owner = useRef(0);
  const subscribe = useCallback((notify: () => void) => generatorSessions.subscribe(notify), []);
  const read = useCallback(() => generatorSessions.read(key), [key]);
  const session = useSyncExternalStore(subscribe, read, () => undefined);
  const state = restoreIcedit(session?.state ?? initial), config = icedItConfig(state);
  useEffect(() => { owner.current = generatorSessions.acquire(key, initial); const token = owner.current; return () => generatorSessions.release(key, token); }, [key, initial]);
  const update = (next: GeneratorState) => generatorSessions.write(key, owner.current, restoreIcedit(next));
  return <div id="create" className={styles.workspace} data-generation-availability="unavailable" data-generator-model={state.model} data-generator-mode={state.mode}>
    <section className={styles.panel} aria-labelledby="icedit-form-title"><h2 id="icedit-form-title"><span className={styles.icon}><Sparkles size={23} aria-hidden="true" /></span>{zh ? '实现你的创意' : 'Create Your Vision'}</h2>
      <form onSubmit={e => e.preventDefault()} className={styles.form}>
        {!config && <div role="status" className={styles.notice}><p>{zh ? '本页不支持当前身份：' : 'This page does not support the current selection: '}{state.model} / {state.mode}</p><button type="button" onClick={() => update(selectIcedit(state))}>{zh ? '选择 ICEdit 单图编辑' : 'Select ICEdit image editing'}</button></div>}
        {config && <PlatformIceditUpload key={`${state.model}:${state.mode}`} config={config} locale={locale} onFiles={() => generatorSessions.markFiles(key, owner.current)} />}
        {session?.filesReleased && <p role="status" className={styles.note}>{zh ? '离开页面后已释放本地文件，请重新选择。' : 'Local files were released after leaving this page. Please select them again.'}</p>}
        <label className={styles.promptLabel} htmlFor="icedit-prompt"><Sparkles size={23} aria-hidden="true" />{zh ? '描述你的创意' : 'Describe Your Vision'}</label>
        <textarea id="icedit-prompt" name="prompt" rows={5} placeholder={zh ? '详细描述你的创意构想…' : 'Describe your creative vision in detail...'} value={state.prompt} onChange={e => update({ ...state, prompt: e.target.value })} />
        <h3>{zh ? '示例提示词' : 'Example Prompts'}</h3>
        <div className={styles.prompts}>{iceditPrompts.map(prompt => <button type="button" key={prompt[0]} onClick={() => update({ ...state, prompt: prompt[zh ? 1 : 0].replace(/^\S+\s/u, '') })}>{prompt[zh ? 1 : 0]}</button>)}</div>
        <button className={styles.generate} type="submit" disabled>{zh ? '编辑图片' : 'Edit Image'} <span aria-hidden="true">✦ 5</span></button>
        <p className={styles.note}>{zh ? '通用图片生成暂不可用。5为原站展示价格，本站不扣费；原有3次美妆额度保持不变。' : 'General image generation is unavailable. 5 is the reference site price; no credits are charged. Your existing 3 makeup uses are unchanged.'}</p>
      </form>
    </section>
    <aside className={styles.panel} aria-labelledby="icedit-history-title"><h2 id="icedit-history-title"><span className={`${styles.icon} ${styles.teal}`}><ImageIcon size={22} aria-hidden="true" /></span>{zh ? '历史记录' : 'History'}</h2><div className={styles.history}><p>{zh ? '暂无本站编辑记录。图片与提示词仅作本地预览。' : 'No edits on this site yet. Images and prompts are for local preview.'}</p></div></aside>
  </div>;
}
