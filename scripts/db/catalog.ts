import type { Sql } from "postgres";
// 结构来自Postgres catalog，不解析DDL，也不携带OID或业务行数据。
export const catalog = async (db: Sql) => {
  const tables = await db`
    select c.relname as name, c.relkind::text as kind, c.relrowsecurity as rls, c.relforcerowsecurity as force_rls,
      coalesce((select jsonb_agg(jsonb_build_object('name',a.attname,'position',a.attnum,'type',pg_catalog.format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_catalog.pg_get_expr(d.adbin,d.adrelid,false),'identity',a.attidentity,'generated',a.attgenerated,'collation',case when a.attcollation=0 then null else a.attcollation::regcollation::text end) order by a.attnum)
        from pg_catalog.pg_attribute a left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),'[]'::jsonb) as columns,
      coalesce((select jsonb_agg(jsonb_build_object('name',k.conname,'type',k.contype,'definition',pg_catalog.pg_get_constraintdef(k.oid,false),'validated',k.convalidated,'deferrable',k.condeferrable,'deferred',k.condeferred) order by k.conname) from pg_catalog.pg_constraint k where k.conrelid=c.oid),'[]'::jsonb) as constraints,
      coalesce((select jsonb_agg(jsonb_build_object('name',i.relname,'definition',pg_catalog.pg_get_indexdef(x.indexrelid,0,false),'valid',x.indisvalid,'ready',x.indisready,'unique',x.indisunique,'primary',x.indisprimary,'replica_identity',x.indisreplident) order by i.relname) from pg_catalog.pg_index x join pg_catalog.pg_class i on i.oid=x.indexrelid where x.indrelid=c.oid),'[]'::jsonb) as indexes,
      coalesce((select jsonb_agg(jsonb_build_object('name',p.polname,'command',p.polcmd,'permissive',p.polpermissive,'roles',(select jsonb_agg(case when r=0 then 'public' else pg_catalog.pg_get_userbyid(r) end order by r) from unnest(p.polroles) r),'using',pg_catalog.pg_get_expr(p.polqual,p.polrelid,false),'check',pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid,false)) order by p.polname) from pg_catalog.pg_policy p where p.polrelid=c.oid),'[]'::jsonb) as policies,
      coalesce((select jsonb_agg(jsonb_build_object('name',t.tgname,'definition',pg_catalog.pg_get_triggerdef(t.oid,false),'enabled',t.tgenabled) order by t.tgname) from pg_catalog.pg_trigger t where t.tgrelid=c.oid and not t.tgisinternal),'[]'::jsonb) as triggers
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p','v','m','f','S') order by c.relname`;
  return Array.from(tables);
};
export const stable = (value: unknown): string => {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v;
  return JSON.stringify(canonical(value));
};
