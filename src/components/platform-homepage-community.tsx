"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import { communityColumnOrder, communityExamples } from "@/lib/platform-homepage-data";
import { HomepageCardImage, HomepageCta } from "./platform-homepage-cards";

const subscribe = (update: () => void) => { window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); };
const getColumns = () => window.innerWidth >= 1536 ? 5 : window.innerWidth >= 1280 ? 4 : 3;

export function HomepageCommunity({ locale }: { locale: Locale }) {
  const columns = useSyncExternalStore(subscribe, getColumns, () => 3);
  const zh = locale === "zh-CN";
  return <>
    <div className="platform-workspace-community-grid">
      {communityColumnOrder[columns].map((ids, column) => <div key={column}>
        {ids.map(id => communityExamples.find(item => item.id === id)!).map(item => (
          <figure className="platform-workspace-reference" key={item.id}>
            <HomepageCardImage src={item.image} alt={zh ? "公开展示案例" : "Public showcase example"}/>
          </figure>
        ))}
      </div>)}
    </div>
    <HomepageCta id="community" locale={locale} secondary>{zh ? "浏览社区" : "Browse community"}</HomepageCta>
  </>;
}
