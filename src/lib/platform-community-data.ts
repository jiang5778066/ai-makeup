import sources from "../../public/images/makeup-demo/来源记录.json";
import { getStyleLibrary } from "./content";
import type { Locale } from "./i18n";

const categories = {
  natural: "everyday",
  "clean-girl": "everyday",
  "k-beauty": "everyday",
  douyin: "everyday",
  "soft-glam": "occasion",
  "date-night": "occasion",
  wedding: "occasion",
  latina: "occasion",
  editorial: "creative",
  gothic: "creative",
  y2k: "creative",
  cosplay: "creative"
} as const;

export type CommunityCategory = (typeof categories)[keyof typeof categories];
export type CommunityExample = {
  id: string;
  image: string;
  category: CommunityCategory;
  name: string;
  description: string;
  model: string;
  quality: string;
};

const sourcesByFile = new Map(sources.map(source => [source.file, source]));

export function getCommunityExamples(locale: Locale): CommunityExample[] {
  const styles = new Map(getStyleLibrary(locale).map(style => [style.id, style]));
  return Object.entries(categories).map(([id, category]) => {
    const filename = `${id}.webp`;
    const source = sourcesByFile.get(filename);
    const style = styles.get(id);
    if (!source || !style) throw new Error(`社区示例缺少素材来源或妆容资料：${id}`);
    return {
      id,
      category,
      image: `/images/makeup-demo/${filename}`,
      name: style.name,
      description: style.description,
      model: source.model,
      quality: source.quality
    };
  });
}
