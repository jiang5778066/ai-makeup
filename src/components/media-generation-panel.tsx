"use client";
import {useMediaGeneration} from '@/hooks/use-media-generation';
import type {MediaDraft} from '@/lib/media-client';
import {loginHref} from '@/lib/auth-return';
import {localizePath} from '@/lib/i18n';
export function MediaGenerationPanel({draft,currentPath,fetcher}:{draft:MediaDraft;currentPath:string;fetcher?:typeof fetch}){
 const {state:s,controller:c,account}=useMediaGeneration(draft,fetcher),zh=draft.locale==='zh-CN',video=draft.mode.endsWith('_video');
 const text=(en:string,cn:string)=>zh?cn:en;
 const errors:Record<string,string>={insufficient_credits:text('Not enough credits. Check your balance before requesting a new quote.','积分不足，请核对余额后重新报价。'),quote_expired:text('This quote expired. Request a new quote and confirm again.','报价已过期，请重新报价并确认。'),invalid_input:text('Use a prompt of 1–3800 characters and exactly one ready reference image for image input modes.','请使用1–3800字提示词；图生模式需恰好一张就绪参考图。'),unauthorized:text('Your session expired. Sign in again before continuing.','登录已失效，请重新登录。'),generation_failed:text('The task has ended. Check its credit status in My Creations.','任务已结束，请在我的作品核对积分状态。')};
 const modelLabel=video?'Grok Imagine Video 1.5 (grok-imagine-video-1.5)':'GPT Image 2 (gpt-image-2)';
 const busy=['uploading','quoting','submitting'].includes(s.status);
 return <section className="platform-generator-field" aria-label={text('Site generation','本站生成')}>
  <strong>{text('Site settings · ','本站参数 · ')}{modelLabel}</strong>
  <p className="platform-generator-hint">{video?text('5 seconds · 480p · text or one first-frame image (JPEG/PNG/WebP, up to 8 MiB). Reference duration, ratio and sound above remain previews. Explicitly choose these site settings before requesting a quote.','5秒 · 480p · 文字或单张首帧（JPEG/PNG/WebP，最大8MiB）。上方来源时长、画幅和声音仍为预览。请明确选择这些本站参数后获取报价。'):text('1k · 2:3 · 1 image · JPEG/PNG/WebP up to 8 MiB. These settings are separate from the reference settings above; enhancement and additional images are not supported.','1k · 2:3 · 单张 · JPEG/PNG/WebP 最大8MiB。本站参数与上方来源参数独立；不支持增强或额外参考图。')}</p>
  {!s.selected&&<button type="button" onClick={()=>c.selectTuple()}>{text('Use these site settings','使用这些本站参数')}</button>}
  {account.status==='loading'?<p role="status">{text('Checking your account…','正在核验账户…')}</p>:account.status==='signed_out'?<a href={loginHref(currentPath)}>{text('Sign in to generate','登录后生成')}</a>:account.status==='error'?<p role="alert">{text('Account service is unavailable.','账户服务暂不可用。')}</p>:null}
  {!c.available()&&<p role="status">{text('Generation is currently unavailable.','生成服务暂未开放。')}</p>}
  <label><input type="checkbox" checked={s.consent} disabled={busy||Boolean(s.task)||s.refreshUnknown} onChange={e=>c.consent(e.target.checked)}/>{video?text('I agree to send this prompt and the selected first frame to the third-party video service and confirm the quoted credits before generation.','我同意将提示词和所选首帧发送给第三方视频服务，并在生成前确认报价积分。'):text('I agree to send this prompt and the selected image to the image service and confirm the quoted credits before generation.','我同意将提示词和所选参考图发送给图片服务，并在生成前确认报价积分。')}</label>
  {!s.task&&!s.refreshUnknown&&s.status!=='unknown'&&<button type="button" className="platform-generator-submit" disabled={!c.available()||!s.selected||!s.consent||busy||account.status!=='signed_in'} onClick={()=>void c.quote()}>{text('Get quote','获取报价')}</button>}
  {s.quote&&s.status==='confirm'&&<div><p>{text(`${modelLabel} · ${s.quote.credits} credits · quote expires ${new Date(s.quote.expiresAt).toLocaleTimeString()}`,`${modelLabel} · ${s.quote.credits} 积分 · 报价到期 ${new Date(s.quote.expiresAt).toLocaleTimeString()}`)}</p><button type="button" onClick={()=>void c.confirm()}>{text(`Confirm ${s.quote.credits} credits`,`确认使用 ${s.quote.credits} 积分`)}</button></div>}
  <div role="status" aria-live="polite">{s.status==='uploading'?text('Uploading and verifying the reference image…','正在上传并核验参考图…'):s.status==='quoting'?text('Getting a quote…','正在获取报价…'):s.status==='submitting'?text('Submitting this request once…','正在提交本次请求…'):s.status==='pending'?text('Processing; credits remain reserved.','正在处理，积分仍预留。'):['unknown','review'].includes(s.status)?text('Under review; credits remain reserved.','结果待核对，积分仍预留。'):s.status==='stopped'?text('Waiting stopped. The provider task may still be running; this does not cancel it or refund credits.','已停止等待。供应商任务可能仍在运行，此操作不取消任务或退还积分。'):s.status==='done'?video?text('Video complete.','视频已完成。'):text('Image complete.','图片已完成。'):null}</div>
  {s.error&&<p role="alert">{errors[s.error]??text('The service could not confirm this operation. Keep this request and check its status.','服务暂时无法确认本次操作，请保留请求并查询原任务。')}</p>}
  {c.originalSubmission()&&<p>{text('Original submission: ','原提交内容：')}{c.originalSubmission()!.prompt}</p>}
  {s.status==='review'&&<p>{text('Keep checking the original task. Contact support if it remains under review.','请继续查询原任务；若长时间未确认，请联系支持核对。')}</p>}
  {s.refreshUnknown&&<p>{text('This tab has an unresolved submission. View My Creations or ask support to reconcile it; refreshing never sends a new generation.','此标签页留有待核对提交，请查看我的作品或联系支持核对；刷新不会重新生成。')}</p>}
  {(s.task||s.status==='unknown')&&<button type="button" disabled={busy} onClick={()=>void c.recover()}>{s.status==='done'?text('Refresh download link','刷新下载链接'):text('Check this submission','查询本次提交')}</button>}
  {(['pending','submitting','uploading','quoting'].includes(s.status))&&<button type="button" onClick={()=>c.stop()}>{text('Stop waiting','停止等待')}</button>}
  {s.status==='done'&&s.task?.result&&<>{s.task.result.mimeType==='video/mp4'?<video src={s.task.result.url} controls preload="metadata" aria-label={text('Your generated video','你的生成视频')}/>:['image/png','image/jpeg','image/webp'].includes(s.task.result.mimeType)?<img src={s.task.result.url} alt={text('Your generated image','你的生成图片')}/>:null}<a href={s.task.result.url} download rel="noreferrer">{text('Download result','下载原结果')}</a></> /* eslint-disable-line @next/next/no-img-element */}
  {s.task&&['done','failed','refunded'].includes(s.task.status)&&<button type="button" onClick={()=>c.newDraft()}>{video?text('Start another video','开始下一个视频'):text('Start another image','开始下一张')}</button>}
  <a href={localizePath('/my-creations',draft.locale)}>{text('My Creations','我的作品')}</a>
 </section>;
}
