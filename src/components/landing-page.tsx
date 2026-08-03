import { BadgeCheck, Camera, Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LandingPage as LandingPageContent } from "@/lib/content";
import { getStyleLibrary, pricingPlans } from "@/lib/content";
import { planIdForCheckout } from "@/lib/checkout-plans";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import type { MakeupPart } from "@/lib/makeup";
import { CheckoutButtons } from "./checkout-buttons";
import { MakeupTool } from "./makeup-tool";
import { SiteShell } from "./site-shell";
import { VirtualTryOn } from "./virtual-try-on";

const VIRTUAL_PART_BY_SLUG: Record<string, MakeupPart> = {
  "ai-lipstick-try-on": "lipstick",
  "ai-foundation-makeup": "foundation",
  "ai-blush-makeup": "blush",
  "ai-eyeshadow": "eyeshadow",
  "ai-eyeliner": "eyeliner",
  "ai-mascara": "mascara",
  "ai-eyebrow": "brows",
  "ai-contour-makeup": "contour",
  "ai-highlighter-makeup": "highlight"
};

const TOOL_LINKS = [
  ["ai-lipstick-try-on", "Lipstick", "口红"],
  ["ai-foundation-makeup", "Foundation", "粉底"],
  ["ai-blush-makeup", "Blush", "腮红"],
  ["ai-eyeshadow", "Eyeshadow", "眼影"],
  ["ai-eyeliner", "Eyeliner", "眼线"],
  ["ai-mascara", "Mascara", "睫毛"],
  ["ai-eyebrow", "Brows", "眉毛"],
  ["ai-contour-makeup", "Contour", "修容"],
  ["ai-highlighter-makeup", "Highlight", "高光"]
] as const;

export function LandingPage({
  locale,
  currentPath,
  page
}: Readonly<{
  locale: Locale;
  currentPath: string;
  page: LandingPageContent;
}>) {
  const styles = getStyleLibrary(locale);
  const isChinese = locale === "zh-CN";
  const focusedVirtualPart = VIRTUAL_PART_BY_SLUG[page.slug];
  const showVirtualTryOn = page.slug === "virtual-makeup-try-on" || Boolean(focusedVirtualPart);
  const heroTitle = page.h1.replaceAll("-", "‑");

  return (
    <SiteShell locale={locale} currentPath={currentPath}>
      <main>
        <section className="container hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={15} aria-hidden="true" /> {page.eyebrow}
            </span>
            <h1><span className="gradient-title">{heroTitle}</span></h1>
            <p className="lead">{page.description}</p>
            <div className="hero-actions">
              <a className="button" href="#try">{page.primaryCta}</a>
              <Link className="ghost-button" href={localizePath("/pricing", locale)}>{page.secondaryCta}</Link>
            </div>
            <div className="trust-row" aria-label={isChinese ? "产品说明" : "Product facts"}>
              <div className="trust-pill"><strong>3</strong><span>{isChinese ? "注册免费生成" : "free signup results"}</span></div>
              <div className="trust-pill"><strong>9</strong><span>{isChinese ? "实时局部妆效" : "live makeup effects"}</span></div>
              <div className="trust-pill"><strong>{isChinese ? "本地" : "Local"}</strong><span>{isChinese ? "预览不上云" : "private preview"}</span></div>
            </div>
          </div>
          <div className="preview-frame" aria-label={isChinese ? "妆容前后对比示意" : "Before and after makeup proof"}>
            <div className="hero-portrait before">
              <Image src="/images/makeup-hero-portrait.jpg" alt={isChinese ? "试妆前的人像" : "Portrait before virtual makeup"} fill priority sizes="(max-width: 760px) 44vw, 24vw" />
              <span>{isChinese ? "试妆前" : "Before"}</span>
            </div>
            <div className="hero-portrait after">
              <Image src="/images/makeup-hero-portrait.jpg" alt={isChinese ? "试妆后的效果" : "Portrait after virtual makeup"} fill priority sizes="(max-width: 760px) 44vw, 24vw" />
              <span>{isChinese ? "试妆后" : "After"}</span>
            </div>
            <div className="preview-divider" aria-hidden="true"><span>↔</span></div>
          </div>
        </section>

        <section className="container section">
          <div className="section-header">
            <div>
              <span className="eyebrow"><Camera size={15} aria-hidden="true" /> {isChinese ? "在线美妆台" : "Online beauty counter"}</span>
              <h2>{showVirtualTryOn ? (isChinese ? "上传或打开摄像头，实时组合九种妆效" : "Upload or open the camera. Build nine effects live.") : (isChinese ? "上传、选择、生成、下载" : "Upload, choose, generate, download")}</h2>
            </div>
            <p>{isChinese ? "实时预览仅在设备上处理；只有生成高清结果时才上传照片。成功结果消耗 1 credit，失败自动退回。" : "Live previews run on your device. Photos upload only for an HD result. Successful results use one credit; failures are returned automatically."}</p>
          </div>
          {showVirtualTryOn ? (
            <VirtualTryOn locale={locale} focusedPart={focusedVirtualPart} />
          ) : (
            <div className="grid generator-layout">
              <MakeupTool locale={locale} styles={styles} cta={page.primaryCta} />
              <div className="grid">
                {page.sections.map((section) => (
                  <article className="panel" key={section}>
                    <Check className="panel-check" size={18} aria-hidden="true" />
                    <h3>{section}</h3>
                    <p>{isChinese ? "用清晰单人正脸照片获得更准确的五官边缘；结果可保存到作品库并随时下载。" : "Use a clear single-person front-facing photo for cleaner feature edges. Save finished results to My Creations."}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="container section">
          <div className="section-header">
            <div>
              <span className="eyebrow"><BadgeCheck size={15} aria-hidden="true" /> {isChinese ? "全脸风格" : "Full-face styles"}</span>
              <h2>{isChinese ? "十二种完整妆容，一张照片直接生成" : "Twelve complete looks from one photo"}</h2>
            </div>
            <p>{isChinese ? "全脸风格使用 AI 生成；局部工具使用实时人脸关键点渲染。两种结果都进入同一个作品库。" : "Full-face looks use AI generation. Part tools use live face-landmark rendering. Both save into the same creation library."}</p>
          </div>
          <div className="grid four">
            {styles.map((style) => (
              <article className="panel style-card" key={style.id}>
                <span className="eyebrow">{style.mood}</span>
                <h3>{style.name}</h3>
                <p>{style.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section">
          <div className="section-header">
            <div>
              <span className="eyebrow"><ShieldCheck size={15} aria-hidden="true" /> {isChinese ? "九个实时工具" : "Nine live tools"}</span>
              <h2>{isChinese ? "从口红到高光，逐层搭配" : "Layer every detail, lipstick to highlight"}</h2>
            </div>
            <p>{isChinese ? "每个工具有独立入口、四种预设与强度控制，也可以在统一试妆台组合使用。" : "Each tool has a dedicated entry, four presets and intensity control, while the shared counter lets you combine them."}</p>
          </div>
          <div className="parts-grid">
            {TOOL_LINKS.map(([slug, en, zh]) => (
              <Link className="part-button" key={slug} href={localizePath(`/${slug}`, locale)}>{isChinese ? zh : en}</Link>
            ))}
          </div>
        </section>

        <PricingSection locale={locale} />
        <FaqSection page={page} locale={locale} />
      </main>
    </SiteShell>
  );
}

export function PricingSection({ locale }: Readonly<{ locale: Locale }>) {
  const isChinese = locale === "zh-CN";
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow"><Lock size={15} aria-hidden="true" /> {isChinese ? "简单价格" : "Simple pricing"}</span>
            <h2>{isChinese ? "先免费生成 3 次，再按次购买" : "Three free results, then pay as you go"}</h2>
          </div>
          <p>{isChinese ? "实时预览免费；每次高清保存消耗 1 credit。Creem 一次性支付，无订阅。" : "Live preview is free. Each saved HD result uses one credit. One-time Creem checkout, no subscription."}</p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => {
            const checkoutPlanId = planIdForCheckout(plan.id);
            return (
              <article className={plan.highlight ? "pricing-card highlight" : "pricing-card"} key={plan.id}>
                <span className="eyebrow">{plan.id === "free" ? (isChinese ? "新账户" : "New account") : (isChinese ? "一次性额度包" : "One-time pack")}</span>
                <div className="price">{plan.monthly}</div>
                <p>{isChinese ? (plan.id === "free" ? "3 次高清结果" : "100 次高清结果") : plan.credits}</p>
                <ul>
                  <li><Check size={15} aria-hidden="true" /> {isChinese ? "全脸 AI 与实时试妆" : "Full-face AI and live try-on"}</li>
                  <li><Check size={15} aria-hidden="true" /> {isChinese ? "作品历史与下载" : "Creation history and downloads"}</li>
                  <li><Check size={15} aria-hidden="true" /> {isChinese ? "失败自动退回 credit" : "Automatic credit return on failure"}</li>
                </ul>
                {checkoutPlanId ? (
                  <CheckoutButtons planId={checkoutPlanId} cta={isChinese ? "使用 Creem 购买 100 次" : "Buy 100 with Creem"} />
                ) : (
                  <Link href="/login" className="ghost-button" style={{ marginTop: 16, width: "100%" }}>{isChinese ? "免费注册" : "Sign up free"}</Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ page, locale }: Readonly<{ page: LandingPageContent; locale: Locale }>) {
  return (
    <section className="container section">
      <div className="section-header">
        <div><span className="eyebrow">FAQ</span><h2>{locale === "zh-CN" ? "使用前常见问题" : "Questions before you try a look"}</h2></div>
      </div>
      <div className="faq">
        {page.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </div>
    </section>
  );
}
