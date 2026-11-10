-- 仅隐藏本人作品；保留任务、退款审计与存储对象。先迁移再开启作品能力。
ALTER TABLE "generations" ADD COLUMN "deleted_at" timestamp with time zone;
CREATE INDEX "generations_visible_user_created_idx"
  ON "generations" ("user_id", "created_at" DESC, "id" DESC)
  WHERE "deleted_at" IS NULL;
