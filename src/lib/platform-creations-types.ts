export type CreationStatus = "queued" | "moderating" | "running" | "failed" | "refunded" | "done" | "reconciling";
export type CreationResult = { url: string; mimeType: string; expiresAt: string | null };
export type CreationDTO = {
  version: 1; id: string; kind: "makeup" | "media"; mediaType: "image" | "video";
  title: string; status: CreationStatus; createdAt: string; updatedAt: string;
  removable: boolean; result: CreationResult | null;
};
export const creationFilters = ["all", "image", "video", "full_face", "lipstick", "foundation", "blush", "eyeshadow", "eyeliner", "mascara", "brows", "contour", "highlight"] as const;
export type CreationFilter = typeof creationFilters[number];
export type CreationQuery = { filter: CreationFilter; limit: number; cursor: { at: string; id: string; kind?: "makeup"|"media" } | null };
export type CreationPage = { items: CreationDTO[]; nextCursor: string | null };
export interface CreationSource {
  connectionState?():Promise<{makeup:"connected"|"unavailable";media:"connected"|"not_connected"|"unavailable"}>;
  // 游标只经当前服务端账户核验后使用；未实现验证的数据源拒绝续页。
  validateCursor?(userId: string, cursor: NonNullable<CreationQuery["cursor"]>): Promise<boolean>;
  list(userId: string, query: CreationQuery): Promise<CreationPage>;
  read(userId: string, id: string): Promise<CreationDTO | null>;
  remove(userId: string, id: string): Promise<"removed" | "not_found" | "in_progress">;
}
export const isCreationActive = (status: CreationStatus) => ["queued", "moderating", "running", "reconciling"].includes(status);
