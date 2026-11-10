import type { NextConfig } from "next";

// 原生子进程按部署模块位置加载sharp；仅追踪相关路由所需的包和平台二进制。
const mediaSharpFiles = [
  "node_modules/sharp/lib/**/*",
  "node_modules/sharp/package.json",
  "node_modules/@img/sharp-*/**/*",
  "node_modules/@img/colour/**/*",
  "node_modules/detect-libc/**/*",
  "node_modules/sharp/node_modules/semver/**/*"
];

const nextConfig: NextConfig = {
  typedRoutes: false,
  outputFileTracingIncludes: {
    "/api/media/**": mediaSharpFiles,
    "/api/inngest": mediaSharpFiles,
    "/api/creations": mediaSharpFiles,
    "/api/creations/**": mediaSharpFiles
  },
  async rewrites() {
    return [{ source: "/zh/ai-makeup", destination: "/zh-CN/ai-makeup" }];
  },
  async redirects() {
    return [
      { source: "/ai-makeup/generator", destination: "/ai-makeup", permanent: true },
      { source: "/ai-makeup/filter", destination: "/virtual-makeup-try-on", permanent: true },
      { source: "/zh-CN/ai-makeup/generator", destination: "/zh-CN/ai-makeup", permanent: true },
      { source: "/zh-CN/ai-makeup/filter", destination: "/zh-CN/virtual-makeup-try-on", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
