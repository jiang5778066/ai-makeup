process.env.NEXT_PUBLIC_SITE_URL ??= "https://example.com";

import "@testing-library/jest-dom/vitest";

// 单测仅使用本机虚构连接；不读取部署环境或建立真实数据库连接。
process.env.DATABASE_URL ??= "postgresql://postgres:fixture_only@127.0.0.1:5432/postgres";
