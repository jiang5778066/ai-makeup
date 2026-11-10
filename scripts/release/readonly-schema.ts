import { command } from './command';
import { buildEnvironment } from './snapshot';
import { TARGET } from './preflight';
import { VERCEL_ENTRY } from './paths';
import { productionDatabase } from '../db/connection';
import { migrationOnClient } from '../db/migration';
import { catalog } from '../db/catalog';

// 仅使用既有CLI登录读取本项目必要数据库配置；不落盘秘密、不访问业务行。
const main = async () => {
  const api = async (path: string) => JSON.parse(await command(process.execPath, [VERCEL_ENTRY, 'api', path, '--scope', TARGET.team, '--raw'], buildEnvironment()));
  const envs = await api(`/v10/projects/${TARGET.project}/env`);
  const entry = envs.envs.filter((item: { key: string; target: string[] }) => item.key === 'DATABASE_URL' && item.target.includes('production'));
  if (entry.length !== 1) throw new Error('未取得唯一生产数据库配置');
  const record = await api(`/v1/projects/${TARGET.project}/env/${entry[0].id}?decrypt=true`);
  if (record.key !== 'DATABASE_URL' || typeof record.value !== 'string') throw new Error('生产数据库配置不可读取');
  const db = productionDatabase(record.value, 'runtime');
  try {
    const state = await migrationOnClient(db, 'status');
    const structure = await db.begin('read only', async tx => {
      await tx`set local search_path=pg_catalog,public`;
      const [identity] = await tx`select current_database() as database, current_user as role, current_setting('server_version_num') as version, current_setting('transaction_read_only') as read_only`;
      const history = await tx`select hash, created_at from drizzle.__drizzle_migrations order by created_at, id`;
      return { identity, history, tables: await catalog(tx as unknown as typeof db) };
    });
    console.log(JSON.stringify({ mode: 'readonly', tls: 'verify-full', supabaseRef: TARGET.supabaseRef, state, ...structure }, null, 2));
  } finally { await db.end(); }
};
main().catch(() => { console.error('线上结构只读核对失败；连接、配置与原始数据库异常已隐藏，未执行迁移。'); process.exitCode = 1; });
