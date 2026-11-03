import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
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
