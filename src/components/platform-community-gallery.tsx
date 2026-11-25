"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { CommunityCategory, CommunityExample } from "@/lib/platform-community-data";
import { CommunityImage, PlatformCommunityDetail } from "./platform-community-detail";
import styles from "./platform-community.module.css";

const galleryCopy = {
  en: {
    title: "Makeup examples",
    source: "FrameKoi examples",
    filter: "Filter by makeup occasion",
    categories: { all: "All", everyday: "Everyday", occasion: "Special occasions", creative: "Creative" }
  },
  "zh-CN": {
    title: "妆容示例",
    source: "FrameKoi 示例",
    filter: "按妆容场景筛选",
    categories: { all: "全部", everyday: "日常", occasion: "特别场合", creative: "创意" }
  }
};

type Filter = CommunityCategory | "all";
type Selection = { item: CommunityExample; trigger: HTMLButtonElement };

export function PlatformCommunityGallery({ locale, examples }: { locale: Locale; examples: CommunityExample[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Selection | null>(null);
  const copy = galleryCopy[locale];
  const filters: Filter[] = ["all", ...new Set(examples.map(item => item.category))];
  const visible = filter === "all" ? examples : examples.filter(item => item.category === filter);

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label={copy.filter}>
          {filters.map(value => (
            <button key={value} type="button" aria-pressed={filter === value} aria-controls="showcase" onClick={() => setFilter(value)}>
              {copy.categories[value]}
            </button>
          ))}
        </div>
        <span className={styles.source}>{copy.source}</span>
      </div>
      <section id="showcase" aria-label={copy.title} className={styles.gallery}>
        <ul className={styles.grid}>
          {visible.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.card}
                aria-label={item.name}
                aria-haspopup="dialog"
                onClick={event => setSelected({ item, trigger: event.currentTarget })}
              >
                <CommunityImage src={item.image} locale={locale} alt="" thumbnail />
                <span className={styles.cardLabel}>
                  <span>{item.name}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      {selected && (
        <PlatformCommunityDetail
          item={selected.item}
          category={copy.categories[selected.item.category]}
          locale={locale}
          trigger={selected.trigger}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
