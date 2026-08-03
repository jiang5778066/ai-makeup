import { count, desc, eq, sql } from "drizzle-orm";
import { Download, FolderOpen, Gauge, Home, Images, Receipt, Settings, WandSparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { generations } from "@/db/schema";
import { getStyleLibrary } from "@/lib/content";
import { R2_BUCKET_RESULTS, isStorageConfigured, presignGetUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/supabase/server";
import { MAKEUP_PARTS } from "@/lib/makeup";
import { generationMatchesFilter } from "@/lib/generation-filter";
import { AccountSettings } from "@/components/account-settings";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(value);
}

async function buildResultUrl(resultKey: string | null) {
  if (!resultKey) return null;
  if (resultKey.startsWith("http")) return resultKey;
  if (!isStorageConfigured()) return null;
  return presignGetUrl({ bucket: R2_BUCKET_RESULTS, key: resultKey, expiresIn: 60 * 15 });
}

const FILTER_LABELS: Record<string, string> = {
  all: "All",
  full_face: "Full face",
  lipstick: "Lipstick",
  foundation: "Foundation",
  blush: "Blush",
  eyeshadow: "Eyeshadow",
  eyeliner: "Eyeliner",
  mascara: "Mascara",
  brows: "Brows",
  contour: "Contour",
  highlight: "Highlight"
};

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const requestedFilter = (await searchParams).filter ?? "all";
  const activeFilter = requestedFilter in FILTER_LABELS ? requestedFilter : "all";

  const styleLibrary = getStyleLibrary("en");
  const [{ db }, { getBalance }] = await Promise.all([
    import("@/db/client"),
    import("@/lib/credits")
  ]);

  const [creditsLeft, [statusCounts], recentRows] = await Promise.all([
    getBalance(user.id),
    db
      .select({
        completed: sql<number>`COUNT(*) FILTER (WHERE ${generations.status} = 'done')::int`,
        inFlight: sql<number>`COUNT(*) FILTER (WHERE ${generations.status} IN ('queued','running'))::int`,
        total: count()
      })
      .from(generations)
      .where(eq(generations.userId, user.id)),
    db
      .select()
      .from(generations)
      .where(eq(generations.userId, user.id))
      .orderBy(desc(generations.createdAt))
      .limit(48)
  ]);

  const recent = await Promise.all(
    recentRows.filter((row) => generationMatchesFilter(row, activeFilter)).map(async (row) => ({
      ...row,
      style: row.mode === "full_face" ? styleLibrary.find((s) => s.id === row.styleId) : undefined,
      resultUrl: row.status === "done" ? await buildResultUrl(row.resultKey) : null
    }))
  );

  return (
    <main className="dashboard-layout">
      <aside className="sidebar-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">M</span>
          <span>Makeup AI</span>
        </Link>
        <nav>
          <Link className="side-link" href="/">
            <Home size={20} aria-hidden="true" /> Home
          </Link>
          <a className="side-link active" href="#projects">
            <Images size={20} aria-hidden="true" /> Projects
          </a>
          <a className="side-link" href="#credits">
            <Gauge size={20} aria-hidden="true" /> Credits
          </a>
          <Link className="side-link" href="/pricing">
            <Receipt size={20} aria-hidden="true" /> Billing
          </Link>
          <a className="side-link" href="#settings">
            <Settings size={20} aria-hidden="true" /> Settings
          </a>
        </nav>
      </aside>
      <section className="dashboard-main">
        <span className="eyebrow">
          <WandSparkles size={16} aria-hidden="true" />
          {user.email}
        </span>
        <h1>
          <span className="gradient-title">Projects, credits,</span>
          <br />
          and exports
        </h1>
        <p className="lead">
          Full-face AI and live try-on results in one place. Filter by makeup part, download an HD result, or start another look.
        </p>

        <div className="metric-row" id="credits">
          <div className="metric">
            <strong>{creditsLeft}</strong>
            <span>credits left</span>
          </div>
          <div className="metric">
            <strong>{statusCounts.completed}</strong>
            <span>generations completed</span>
          </div>
          <div className="metric">
            <strong>{statusCounts.inFlight}</strong>
            <span>in progress</span>
          </div>
          <div className="metric">
            <strong>{statusCounts.total}</strong>
            <span>lifetime total</span>
          </div>
        </div>

        <nav className="creation-filters" aria-label="Filter creations">
          {["all", "full_face", ...MAKEUP_PARTS].map((filter) => (
            <Link
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              href={filter === "all" ? "/dashboard" : `/dashboard?filter=${filter}`}
            >
              {FILTER_LABELS[filter]}
            </Link>
          ))}
        </nav>

        {recent.length === 0 ? (
          <div className="dashboard-card" id="projects" style={{ textAlign: "center", padding: 32 }}>
            <FolderOpen size={32} aria-hidden="true" />
            <h3 style={{ marginTop: 12 }}>No generations yet</h3>
            <p style={{ marginBottom: 16 }}>
              {activeFilter === "all"
                ? "Upload a selfie or open the live camera to create your first look. New accounts include 3 credits."
                : `No ${FILTER_LABELS[activeFilter].toLowerCase()} creations yet.`}
            </p>
            <Link className="button" href="/#try">
              <WandSparkles size={16} aria-hidden="true" />
              Start a generation
            </Link>
          </div>
        ) : (
          <div className="grid three" id="projects">
            {recent.map((item) => (
              <article className="dashboard-card" key={item.id}>
                <span className="eyebrow">
                  {item.status === "done"
                    ? "Ready"
                    : item.status === "failed"
                      ? "Failed"
                      : item.status === "running"
                        ? "Generating"
                        : "Queued"}
                </span>
                <h3>{item.mode === "virtual_try_on" ? "Live virtual try-on" : item.style?.name ?? item.styleId}</h3>
                <p>
                  {formatDate(new Date(item.createdAt))} · {item.mode === "virtual_try_on" ? "layered effects" : `intensity ${item.intensity}%`}
                </p>
                {item.status === "done" && item.resultUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="creation-thumbnail" src={item.resultUrl} alt="Saved makeup result" />
                    <a className="ghost-button" href={item.resultUrl} target="_blank" rel="noopener noreferrer">
                      <Download size={16} aria-hidden="true" /> Download
                    </a>
                  </>
                ) : item.status === "failed" ? (
                  <p style={{ color: "var(--cherry)", fontSize: "0.9rem" }}>{item.error ?? "Generation failed"}</p>
                ) : item.status === "refunded" ? (
                  <p style={{ color: "var(--cherry)", fontSize: "0.9rem" }}>Failed · credit returned</p>
                ) : (
                  <p style={{ fontSize: "0.9rem" }}>Refresh to check progress.</p>
                )}
              </article>
            ))}
          </div>
        )}

        <AccountSettings />
      </section>
    </main>
  );
}
