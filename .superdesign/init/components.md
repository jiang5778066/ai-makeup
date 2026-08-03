# Components

## `src/components/makeup-tool.tsx`
Client-side makeup tool with upload surface, style chips, intensity slider, generation CTA, and result panel.

```tsx
"use client";

import { Download, ImagePlus, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { MakeupStyle } from "@/lib/content";

type GenerationResponse = {
  resultImageUrl: string;
  beforeImageUrl: string;
  styleName: string;
  fitNotes: string[];
  downloadUrl: string;
};

export function MakeupTool({
  locale,
  styles,
  cta
}: Readonly<{ locale: Locale; styles: MakeupStyle[]; cta: string }>) {
  const [styleId, setStyleId] = useState(styles[0]?.id ?? "natural");
  const [intensity, setIntensity] = useState(62);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const selectedStyle = useMemo(() => styles.find((style) => style.id === styleId) ?? styles[0], [styleId, styles]);

  async function generate() {
    setStatus("loading");
    const response = await fetch("/api/makeup/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styleId,
        intensity,
        locale,
        image: "mock-selfie"
      })
    });
    const payload = (await response.json()) as GenerationResponse;
    setResult(payload);
    setStatus("done");
  }

  return null;
}
```
