import { databaseStatus, migrateDatabase } from "./migration";
const main = async () => {
  const url = process.env.MIGRATION_DATABASE_URL;
  if (!url) throw new Error("缺少迁移专用连接");
  const command = process.argv[2];
  if (command !== "status" && command !== "migrate") throw new Error("不支持的数据库操作");
  const status = await (command === "migrate" ? migrateDatabase(url) : databaseStatus(url));
  console.log(JSON.stringify(status));
};
main().catch(() => { console.error("数据库预检或迁移失败；已隐藏连接与数据库异常，请按操作手册排查。"); process.exitCode = 1; });
