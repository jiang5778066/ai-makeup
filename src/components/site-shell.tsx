import {
  Camera,
  CircleDollarSign,
  FolderHeart,
  ImageIcon,
  Languages,
  Menu,
  Palette,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

const primaryNavigation = [
  { href: "/ai-makeup", icon: ImageIcon, label: { en: "AI Makeup", "zh-CN": "AI 全脸妆容" } },
  { href: "/virtual-makeup-try-on", icon: Camera, label: { en: "Live Try-On", "zh-CN": "实时试妆" } }
] as const;

const tools = [
  { href: "/ai-lipstick-try-on", label: { en: "Lipstick", "zh-CN": "口红" } },
  { href: "/ai-foundation-makeup", label: { en: "Foundation", "zh-CN": "粉底" } },
  { href: "/ai-blush-makeup", label: { en: "Blush", "zh-CN": "腮红" } },
  { href: "/ai-eyeshadow", label: { en: "Eyeshadow", "zh-CN": "眼影" } },
  { href: "/ai-eyeliner", label: { en: "Eyeliner", "zh-CN": "眼线" } },
  { href: "/ai-mascara", label: { en: "Mascara", "zh-CN": "睫毛" } },
  { href: "/ai-eyebrow", label: { en: "Brows", "zh-CN": "眉毛" } },
  { href: "/ai-contour-makeup", label: { en: "Contour", "zh-CN": "修容" } },
  { href: "/ai-highlighter-makeup", label: { en: "Highlight", "zh-CN": "高光" } }
] as const;

export function SiteShell({
  locale,
  currentPath,
  children
}: Readonly<{
  locale: Locale;
  currentPath: string;
  children: React.ReactNode;
}>) {
  const alternateLocale: Locale = locale === "en" ? "zh-CN" : "en";
  const isChinese = locale === "zh-CN";
  const isActive = (href: string) => currentPath === href || currentPath.endsWith(href);

  return (
    <div className={`site-shell${currentPath === "/" || currentPath.endsWith("/ai-makeup") || currentPath === "/zh-CN" ? " reference-shell" : ""}`}>
      <header className="boutique-header">
        <div className="nav-inner">
          <Link className="boutique-brand" href={localizePath("/", locale)} aria-label="Makeup AI home">
            <span className="brand-seal">M</span>
            <span>
              <strong>Makeup AI</strong>
              <small>{isChinese ? "在线虚拟试妆" : "Virtual makeup studio"}</small>
            </span>
          </Link>

          <div className="nav-actions">
            <Link className="language-link" href={localizePath(currentPath, alternateLocale)} aria-label={isChinese ? "Switch to English" : "切换到中文"}>
              <Languages size={16} aria-hidden="true" /> {isChinese ? "EN" : "中文"}
            </Link>
            <Link className="projects-link" href="/dashboard">
              <FolderHeart size={16} aria-hidden="true" /> {isChinese ? "我的作品" : "My creations"}
            </Link>
            <Link className="nav-cta" href={`/login?next=${encodeURIComponent(localizePath(currentPath, locale))}`}>
              <Sparkles size={15} aria-hidden="true" /> {isChinese ? "登录领 3 次" : "Get 3 free"}
            </Link>
            <details className="mobile-menu">
              <summary aria-label={isChinese ? "打开导航" : "Open navigation"}><Menu size={20} aria-hidden="true" /></summary>
              <nav aria-label={isChinese ? "移动菜单" : "Mobile menu"}>
                {primaryNavigation.map((item) => <Link key={item.href} href={localizePath(item.href, locale)}>{item.label[locale]}</Link>)}
                {tools.map((tool) => <Link key={tool.href} href={localizePath(tool.href, locale)}>{tool.label[locale]}</Link>)}
                <Link href={localizePath("/pricing", locale)}>{isChinese ? "价格" : "Pricing"}</Link>
                <Link href="/dashboard">{isChinese ? "我的作品" : "My creations"}</Link>
                <Link href={localizePath(currentPath, alternateLocale)}>{isChinese ? "English" : "简体中文"}</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <div className="site-frame">
        <aside className="marketing-sidebar">
          <nav className="desktop-nav" aria-label={isChinese ? "主导航" : "Primary navigation"}>
            <span className="sidebar-label">{isChinese ? "开始" : "Start"}</span>
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  className={isActive(item.href) ? "nav-link active" : "nav-link"}
                  href={localizePath(item.href, locale)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label[locale]}
                </Link>
              );
            })}
            <Link className="nav-link" href="/dashboard">
              <FolderHeart size={18} aria-hidden="true" /> {isChinese ? "我的作品" : "My creations"}
            </Link>

            <span className="sidebar-label">{isChinese ? "局部试妆" : "Makeup tools"}</span>
            {tools.map((tool) => (
              <Link
                key={tool.href}
                className={isActive(tool.href) ? "nav-link active compact" : "nav-link compact"}
                href={localizePath(tool.href, locale)}
              >
                <Palette size={16} aria-hidden="true" />
                {tool.label[locale]}
              </Link>
            ))}

            <span className="sidebar-label">{isChinese ? "账户" : "Account"}</span>
            <Link className={isActive("/pricing") ? "nav-link active pricing-link" : "nav-link pricing-link"} href={localizePath("/pricing", locale)}>
              <CircleDollarSign size={18} aria-hidden="true" /> {isChinese ? "价格" : "Pricing"}
            </Link>
          </nav>
        </aside>

        <div className="site-content">
          <nav className="mobile-product-nav" aria-label={isChinese ? "移动端产品导航" : "Mobile product navigation"}>
            {primaryNavigation.map((item) => (
              <Link key={item.href} className={isActive(item.href) ? "active" : ""} href={localizePath(item.href, locale)}>
                {item.label[locale]}
              </Link>
            ))}
            <Link className={isActive("/pricing") ? "active" : ""} href={localizePath("/pricing", locale)}>{isChinese ? "价格" : "Pricing"}</Link>
          </nav>

          {children}

          <footer className="boutique-footer">
            <div className="footer-inner">
              <div>
                <span className="brand-seal small">M</span>
                <h2>{isChinese ? "先试妆，再决定。" : "Try the look. Then decide."}</h2>
                <p>{isChinese ? "上传照片，选择妆容，查看前后对比。" : "Upload a photo, choose a look, and compare the result."}</p>
              </div>
              <div className="footer-links">
                <div>
                  <strong>{isChinese ? "产品" : "Product"}</strong>
                  <Link href={localizePath("/ai-makeup", locale)}>{isChinese ? "AI 妆容" : "AI makeup"}</Link>
                  <Link href={localizePath("/virtual-makeup-try-on", locale)}>{isChinese ? "实时试妆" : "Live try-on"}</Link>
                  <Link href={localizePath("/pricing", locale)}>{isChinese ? "价格" : "Pricing"}</Link>
                </div>
                <div>
                  <strong>{isChinese ? "账户" : "Account"}</strong>
                  <Link href="/dashboard">{isChinese ? "我的作品" : "My creations"}</Link>
                  <Link href="/login">{isChinese ? "登录" : "Sign in"}</Link>
                </div>
                <div>
                  <strong>{isChinese ? "条款" : "Legal"}</strong>
                  <Link href="/legal/privacy">{isChinese ? "隐私" : "Privacy"}</Link>
                  <Link href="/legal/terms">{isChinese ? "服务条款" : "Terms"}</Link>
                  <Link href="/legal/cookies">Cookies</Link>
                </div>
              </div>
            </div>
            <div className="footer-bottom">© 2026 Makeup AI · {isChinese ? "Beta 开发中" : "Beta in development"}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
