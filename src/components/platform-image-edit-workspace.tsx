"use client";

import { Suspense, useCallback, useLayoutEffect, useState } from "react";
import { ArrowRight, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { MediaGenerationPanel } from "./media-generation-panel";
import { PlatformGeneratorUpload } from "./platform-generator-upload";
import { localizePath, type Locale } from "@/lib/i18n";
import {
  ageProgressionPath, hairColorPath, hairStylePath, imageStylePath, photoRestorationPath,
  imageEditContent, imageEditPrompt, isPortraitImageEditPath, portraitImageEditSettings, resolveImageEditOption,
  type ImageEditPath,
} from "@/lib/platform-image-edit-data";
import { platformNavigationEvent } from "./platform-navigation-link";
import { usePlatformUrl } from "./use-platform-url";
import { usePlatformAccount } from "@/lib/platform-account-session";

const imageInput = { max: 1, accept: "image/jpeg,image/png,image/webp", maxBytes: 8 * 1024 * 1024, localByteLimit: false };
const ignoreLocalSelection = () => undefined;

function EditForm({ path, locale, url }: { path: ImageEditPath; locale: Locale; url: string }) {
  const query = new URL(url, "https://framekoi.invalid").searchParams;
  const portrait = isPortraitImageEditPath(path);
  const zh = locale === "zh-CN";
  const content = imageEditContent[path];
  const [selectedId, setSelectedId] = useState(() => resolveImageEditOption(path, query)?.id ?? "");
  const selection = portrait ? resolveImageEditOption(path, query) : content.options.find(option => option.id === selectedId);
  const account = usePlatformAccount();
  const owner = `${account.epoch}:${account.user?.id ?? ""}`;
  const [input, setInput] = useState<{ files: File[]; version: number; owner: string }>();
  const onReadyFiles = useCallback((readyFiles: File[], version: number) => {
    setInput({ files: readyFiles, version, owner });
  }, [owner]);
  const inputPrompt = selection ? imageEditPrompt(path, selection, locale) : "";
  const currentInput = input?.owner === owner ? input : undefined;
  const generatorDraft = {
    model: "gpt-image-2", mode: "image_to_image" as const, prompt: inputPrompt, locale,
    files: currentInput?.files ?? [], selectionVersion: currentInput?.version ?? 0,
    sourceSelection: selection ? `${path}:${selection.id}` : undefined,
  };
  const portraitSettings = portrait ? portraitImageEditSettings[path] : undefined;
  const hairColor = path === hairColorPath;
  const hairStyle = path === hairStylePath;
  const optionLabel = portraitSettings?.label[locale] ?? (path === photoRestorationPath
    ? (zh ? "修复操作" : "Repair operation")
    : (zh ? "转换风格" : "Visual style"));

  function selectOption(id: string, index: number) {
    if (!portraitSettings) {
      setSelectedId(id);
      return;
    }
    const current = new URL(window.location.href);
    if (!selection) {
      for (const key of ["model", "mode", "tab", portraitSettings.parameter]) current.searchParams.delete(key);
    }
    current.searchParams.set(portraitSettings.parameter, path === ageProgressionPath ? String(index) : id);
    window.history[selection ? "pushState" : "replaceState"](null, "", current);
    window.dispatchEvent(new Event(platformNavigationEvent));
  }

  return <div className="platform-image-edit-workspace" id="generator">
    <form className="platform-image-edit-form" aria-label={zh ? "图片编辑设置" : "Image editing settings"} onSubmit={event => event.preventDefault()}>
      <h2><Sparkles size={20}/>{zh ? "编辑工作区" : "Edit workspace"}</h2>
      {selection && <div className="platform-image-edit-upload">
        <h3><ImageIcon size={17}/>{zh ? "选择一张图片" : "Choose one image"}</h3>
        <p>{zh ? "单张 JPEG、PNG 或 WebP，最大 8 MiB。" : "One JPEG, PNG or WebP image, up to 8 MiB."}</p>
        <PlatformGeneratorUpload key={owner} config={imageInput} locale={locale} label={zh ? "图片文件" : "Image file"}
          onFiles={ignoreLocalSelection} onReadyFiles={onReadyFiles} remoteConsentRequired/>
      </div>}
      <fieldset className="platform-image-edit-options" id={hairColor ? "hair-examples" : hairStyle ? "showcase" : undefined}
        data-image-edit-anchor={hairColor || hairStyle ? "" : undefined}>
        <legend id={hairColor ? "hair-templates" : undefined} data-image-edit-anchor={hairColor ? "" : undefined}>{optionLabel}</legend>
        {content.options.map((option, index) => <label key={option.id} data-selected={selection?.id === option.id}>
          <input type="radio" name={`image-edit-option-${path}`} value={option.id} checked={selection?.id === option.id}
            onChange={() => selectOption(option.id, index)}/>
          {option.swatch && <span className="platform-image-edit-swatch" style={{ backgroundColor: option.swatch }} aria-hidden="true"/>}
          <span className="platform-image-edit-option-copy"><strong>{option.label[locale]}</strong><small>{option.instruction[locale]}</small></span>
          {selection?.id === option.id && <Check size={17}/>}
        </label>)}
      </fieldset>
      {!selection && <p role="alert" className="platform-image-edit-error">{portraitSettings
        ? (zh ? "链接中的人像编辑参数不受支持。请选择上方的一项以恢复编辑。"
          : "The portrait settings in this link are unsupported. Choose one option above to resume editing.")
        : (zh ? "链接中的操作或风格不受支持，请选择上方的一项以恢复。"
          : "The requested style or operation is unsupported. Choose one above to restore this edit.")}</p>}
      {selection && <><label className="platform-image-edit-prompt-label" htmlFor="image-edit-prompt">{zh ? "本次编辑说明" : "Edit instructions for this request"}</label>
      <textarea id="image-edit-prompt" value={inputPrompt} readOnly/>
      <p className="platform-image-edit-intent"><strong>{zh ? "报价前请核对提交内容" : "Review before requesting a quote"}</strong>
        {zh ? "模型 gpt-image-2 · 图生图 · 1k · 2:3 · 单张。添加图片时仅在本地预览。勾选同意并获取报价后，FrameKoi 会上传并核验图片，并用这段编辑说明获取报价。确认报价后，本站才会创建任务并交由图片供应商处理。"
          : "Model gpt-image-2 · image_to_image · 1k · 2:3 · 1 image. Adding an image opens a local preview. When you consent and request a quote, FrameKoi uploads and verifies the image and uses these instructions to calculate the quote. After you confirm the quote, FrameKoi creates a task for the image provider."}</p></>}
      <div id={path === imageStylePath ? "image-style-history" : undefined}>
        {selection && <MediaGenerationPanel key={path} draft={generatorDraft}
          currentPath={portrait ? url : localizePath(path, locale)}/>}
      </div>
      <a className="platform-image-edit-return-link" href={localizePath("/image-effects", locale)}>
        {zh ? "返回图片特效" : "Back to Image Effects"}<ArrowRight size={15}/>
      </a>
    </form>
    <aside className="platform-image-edit-guide" aria-label={zh ? "本地处理步骤" : "Local preview steps"}>
      {hairColor && <><span id="hair-steps" data-image-edit-anchor/><span id="hair-features" data-image-edit-anchor/></>}
      {hairStyle && <><span id="how-to-use" data-image-edit-anchor/><span id="features" data-image-edit-anchor/></>}
      <h2>{zh ? "先在本机预览，再确认服务设置" : "Preview locally. Review service settings."}</h2>
      <ol>
        <li><strong>{zh ? "添加原图" : "Add your original"}</strong><p>{zh ? "图片在浏览器本地解码。此时不会上传。" : "The image is decoded in your browser. No upload happens at this step."}</p></li>
        <li><strong>{zh ? "核对编辑说明" : "Review the edit instructions"}</strong><p>{zh ? "选择一项编辑后，工作区会显示本次使用的说明。" : "Choose an edit to see the instructions for your request."}</p></li>
        <li><strong>{zh ? "查看实时报价" : "Review the live quote"}</strong><p>{zh ? "服务开放时，登录、同意后获取报价，再确认是否提交。" : "When generation is available, sign in and consent to request a quote. Confirm the quote to submit."}</p></li>
      </ol>
      <p className="platform-image-edit-result-note" id={hairColor ? "hair-closing" : undefined}>{portraitSettings
        ? (zh ? "页面图案为示意，选图后显示的是本机原图。实际编辑结果由图像供应商处理后显示。"
          : "The page artwork is illustrative. The local preview shows your original photo. The edited result is shown after the image provider processes the task.")
        : zh ? "结果只会在服务处理完成后显示。当前示例仅为你选择的本地原图预览，不预设修复效果。" : "A result appears only after service processing completes. The only preview shown is the original photo you choose here."}</p>
    </aside>
  </div>;
}

type WorkspaceProps = { path: ImageEditPath; locale: Locale; initialQuery: string };

function shellPath({ path, locale, initialQuery }: WorkspaceProps) {
  return localizePath(path, locale) + (initialQuery ? "?" + initialQuery : "");
}

function LegacyWorkspace(props: WorkspaceProps) {
  const { path, locale } = props;
  const url = usePlatformUrl(shellPath(props));
  const current = new URL(url, "https://framekoi.invalid");
  if (current.pathname !== localizePath(path, locale)) return null;
  return <EditForm key={current.search} path={path} locale={locale} url={url}/>;
}

function ObserveWorkspaceUrl({ serverPath, onLocation }: { serverPath: string; onLocation: (url: string) => void }) {
  const url = usePlatformUrl(serverPath);
  useLayoutEffect(() => { onLocation(url); }, [onLocation, url]);
  return null;
}

function PortraitWorkspace(props: WorkspaceProps) {
  const { path, locale } = props;
  const serverPath = shellPath(props);
  const [location, setLocation] = useState(serverPath);
  const current = new URL(location, "https://framekoi.invalid");
  const active = current.pathname === localizePath(path, locale);
  const valid = resolveImageEditOption(path, current.searchParams) !== null;
  return <>
    {/* 首屏直接渲染工作区和锚点。仅 Next URL 订阅等待客户端恢复。 */}
    <Suspense fallback={null}><ObserveWorkspaceUrl serverPath={serverPath} onLocation={setLocation}/></Suspense>
    {active && <EditForm key={valid ? "valid" : "invalid"} path={path} locale={locale} url={location}/>}
  </>;
}

export function PlatformImageEditWorkspace(props: WorkspaceProps) {
  const { path, locale } = props;
  const key = path + ":" + locale;
  if (isPortraitImageEditPath(path)) return <PortraitWorkspace key={key} {...props}/>;
  return <Suspense fallback={<p>{locale === "zh-CN" ? "正在准备编辑工作区…" : "Preparing edit workspace…"}</p>}>
    <LegacyWorkspace key={key} {...props}/>
  </Suspense>;
}
