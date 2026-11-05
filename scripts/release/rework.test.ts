// @vitest-environment node
import { describe, expect, it } from "vitest";
import { preflight, TARGET, validateRuntime, runtimeRequired, type ReleaseConfig } from "./preflight";
const migrationUrl = `postgresql://postgres:fixture@db.${TARGET.supabaseRef}.supabase.co:5432/postgres?sslmode=verify-full`;
const c: ReleaseConfig = { sha: "a".repeat(40), repository: TARGET.repository, ref: "refs/heads/main", workflowRef: `${TARGET.repository}/.github/workflows/release.yml@refs/heads/main`, project: TARGET.project, team: TARGET.team, domain: TARGET.domain, supabaseRef: TARGET.supabaseRef, token: "fixture", migrationUrl };
const runtime = () => ({ ...Object.fromEntries(runtimeRequired.map(k => [k, "fixture"])), DATABASE_URL: migrationUrl, NEXT_PUBLIC_SITE_URL: `https://${TARGET.domain}`, NEXT_PUBLIC_SUPABASE_URL: `https://${TARGET.supabaseRef}.supabase.co` });
describe("连接边界返工反例", () => {
  it.each(["&sslmode=disable", "&ssl=false", "&host=evil.test", "&port=6543", "&user=other", "&options=-c%20search_path%3Devil", "#fragment"])("迁移拒绝覆盖 %s", suffix => expect(() => preflight({ ...c, migrationUrl: migrationUrl + suffix })).toThrow());
  it.each([migrationUrl.replace("postgresql:", "https:"), migrationUrl.replace(":fixture@", "@"), migrationUrl.replace("/postgres?", "/other?"), migrationUrl.replace("5432", "6543"), migrationUrl.replace("sslmode=verify-full", "sslmode=disable")])("runtime拒绝非法连接", value => expect(() => validateRuntime({ ...runtime(), DATABASE_URL: value })).toThrow());
  it("runtime接受目标事务池而迁移拒绝", () => {
    const pool = `postgresql://postgres.${TARGET.supabaseRef}:fixture@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=verify-full`;
    expect(() => validateRuntime({ ...runtime(), DATABASE_URL: pool })).not.toThrow();
    expect(() => preflight({ ...c, migrationUrl: pool })).toThrow();
  });
});
