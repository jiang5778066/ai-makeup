import type { Metadata } from "next";
import Link from "next/link";
import { alternateLanguagesForPath, localizePath, type Locale } from "@/lib/i18n";
import { LegalShell } from "./legal-shell";
import { SupportContact } from "./support-contact";

export type TrustSection = "about" | "refund" | "content-moderation-policy";
const titles: Record<TrustSection, Record<Locale, string>> = {
  about: { en: "About FrameKoi", "zh-CN": "关于 FrameKoi" },
  refund: { en: "Refund Policy", "zh-CN": "退款政策" },
  "content-moderation-policy": { en: "Acceptable Use & Content Moderation", "zh-CN": "可接受使用与内容审核政策" }
};

export function trustMetadata(section: TrustSection, locale: Locale): Metadata {
  const path = `/${section}`;
  return { title: titles[section][locale], alternates: { canonical: localizePath(path, locale), languages: alternateLanguagesForPath(path) } };
}

export function TrustPage({ section, locale }: Readonly<{ section: TrustSection; locale: Locale }>) {
  const zh = locale === "zh-CN";
  return <LegalShell title={titles[section][locale]} lastUpdated="2026-11-24" currentPath={localizePath(`/${section}`, locale)} locale={locale}>
    {section === "about" && <>
      <p>{zh ? "FrameKoi 是由中国北京的独立开发者以个人身份运营的创作项目，面向个人创作者和社交媒体用户。" : "FrameKoi is a creative project operated by an independent developer based in Beijing, China, for individual creators and social media users."}</p>
      <h2>{zh ? "产品与开放状态" : "Our product and availability"}</h2>
      <p>{zh ? "我们正在建设图片、视频和视觉特效工具。各工具页面会说明当前可用的功能；展示页、本地预览和第三方参考素材不代表本站已提供相应生成能力。" : "We are building tools for images, video, and visual effects. Each tool explains its current availability. Showcase pages, local previews, and third-party reference media do not mean the corresponding generation feature is available."}</p>
      <p>{zh ? "FrameKoi 是独立产品，不隶属于其页面提到的模型厂商，也不代表获得其背书。第三方模型名称用于说明相关技术或集成。" : "FrameKoi is an independent product, not affiliated with or endorsed by the model providers mentioned on our pages. Model names describe the relevant technology or integrations."}</p>
      <h2>{zh ? "联系与支持" : "Contact and support"}</h2>
      <p><SupportContact locale={locale} /></p>
    </>}
    {section === "refund" && <>
      <p>{zh ? "本政策适用于 FrameKoi 的一次性积分购买。以结账时明确展示的商品、价格和开放状态为准；未开放的工具不能因购买积分而自动解锁。" : "This policy covers one-time FrameKoi credit purchases. The product, price, and availability shown at checkout apply. Buying credits does not unlock tools marked as unavailable."}</p>
      <h2>{zh ? "未使用积分包" : "Unused credit packs"}</h2>
      <p>{zh ? "某笔积分包全部未使用时，可以申请该笔购买的全额退款。已使用或部分使用的积分包不适用常规全额退款；此规则不限制适用法律赋予您的权利。" : "You may request a full refund for a purchase while every credit in that specific pack remains unused. Used or partly used packs are not eligible for the standard full-refund policy. This does not limit rights you have under applicable law."}</p>
      <h2>{zh ? "失败任务与重复扣费" : "Failed tasks and duplicate charges"}</h2>
      <p>{zh ? "生成失败应按该工具的计费规则返还预扣积分，这与现金退款不同。如遇重复扣费或未收到购买积分，请提供订单编号以便核实。" : "Failed generations should return reserved credits according to the tool's billing rules; this is different from a cash refund. Report duplicate charges or missing purchased credits with the order reference so they can be investigated."}</p>
      <h2>{zh ? "如何申请" : "How to request a refund"}</h2>
      <p>{zh ? "请使用购买时的邮箱联系支持，附上订单编号和问题描述，不要发送完整银行卡号或安全码。退款通过原支付渠道处理，到账时间取决于支付机构及银行。" : "Contact support from your purchase email with the order reference and a description of the issue. Do not send full card numbers or security codes. Approved refunds go through the original payment method; timing depends on the payment provider and bank."}</p>
      <p><SupportContact locale={locale} /></p>
    </>}
    {section === "content-moderation-policy" && <>
      <p>{zh ? "本政策适用于输入文字、上传图片或视频、生成结果及公开展示内容。您只能提交自己拥有权利或取得有效授权的素材。" : "This policy applies to prompts, uploaded images and videos, generated outputs, and public showcases. Submit only material you own or have valid permission to use."}</p>
      <h2>{zh ? "禁止内容与用途" : "Prohibited content and uses"}</h2>
      <ul>
        <li>{zh ? "色情、露骨或性暗示内容，以及涉及未成年人的性化或剥削内容。" : "Pornographic, explicit, or sexually suggestive content, including sexualization or exploitation of minors."}</li>
        <li>{zh ? "未经同意的换脸、深度伪造、裸体化，或用于冒充、欺骗、骚扰他人的人物图像操纵。" : "Non-consensual face swaps, deepfakes, nudification, or manipulation of a person's likeness for impersonation, deception, or harassment."}</li>
        <li>{zh ? "极端暴力、恐怖主义、仇恨、非法活动及侵害隐私或知识产权的内容。" : "Extreme violence, terrorism, hate, illegal activity, or violations of privacy or intellectual property rights."}</li>
        <li>{zh ? "绕过内容审核、访问限制、支付或积分规则。" : "Bypassing moderation, access restrictions, payment, or credit rules."}</li>
      </ul>
      <h2>{zh ? "审核与处理" : "Review and enforcement"}</h2>
      <p>{zh ? "相关工具可能在输入和生成环节执行自动审核。违反政策的请求或内容可被拒绝或移除，相关账户可被限制或停用。自动审核可能出错；如需申诉，请提供相关任务或内容编号。" : "Tools may apply automated checks to inputs and generation workflows. Requests or content that violate these rules may be blocked or removed, and accounts may be restricted or suspended. Automated checks can make mistakes; include the task or content reference when requesting a review."}</p>
      <p><SupportContact locale={locale} /></p>
    </>}
    <p><Link href="/legal/terms">{zh ? "服务条款" : "Terms of Service"}</Link> · <Link href="/legal/privacy">{zh ? "隐私政策" : "Privacy Policy"}</Link></p>
  </LegalShell>;
}
