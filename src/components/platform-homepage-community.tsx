"use client";

import { useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { communityColumnOrder, communityExamples } from "@/lib/platform-homepage-data";
import { homepageEntry } from "@/lib/platform-homepage";
import { HomepageCardImage } from "./platform-homepage-cards";
import { PlatformLink } from "./platform-link";

const subscribe = (update: () => void) => { window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); };
const getColumns = () => window.innerWidth >= 1536 ? 5 : window.innerWidth >= 1280 ? 4 : 3;
export function HomepageCommunity({ locale }: { locale: Locale }) {
  const columns = useSyncExternalStore(subscribe, getColumns, () => 3);
  return <div className="platform-workspace-community-grid">{communityColumnOrder[columns].map((ids, column) => <div key={column}>{ids.map(id => communityExamples.find(item => item.id === id)!).map(item => <PlatformLink entry={{ ...homepageEntry("community"), query: { example: item.id } }} locale={locale} key={item.id}><HomepageCardImage src={item.image} alt={`${locale === "zh-CN" ? "公开展示案例" : "Public showcase example"} ${item.id}`}/><span className="platform-home-community-arrow" aria-hidden="true"><ArrowUpRight size={12}/></span></PlatformLink>)}</div>)}</div>;
}
