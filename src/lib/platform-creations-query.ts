import { creationFilters, type CreationFilter, type CreationQuery } from "./platform-creations-types";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const makeupCreationId = (value: string) => value.startsWith("makeup:") && uuid.test(value.slice(7)) ? value.slice(7) : null;
export const encodeCreationCursor = (filter: CreationFilter, at: string, id: string) => Buffer.from(JSON.stringify({ v: 1, filter, at, id })).toString("base64url");
export const parseCreationQuery = (url: URL): CreationQuery | null => {
  const filter = url.searchParams.get("filter") ?? "all";
  const rawLimit = url.searchParams.get("limit") ?? "12";
  const limit = Number(rawLimit);
  if (!creationFilters.includes(filter as CreationFilter) || !/^\d{1,2}$/.test(rawLimit) || limit < 1 || limit > 24) return null;
  let cursor: CreationQuery["cursor"] = null;
  const raw = url.searchParams.get("cursor");
  if (raw !== null) {
    if (!/^[\w-]{1,512}$/.test(raw)) return null;
    try {
      const value = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
      if (![1,2].includes(value.v) || value.v===2 && !["makeup","media"].includes(value.kind) || value.filter !== filter || typeof value.at !== "string" || (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(?:\d{3})?Z$/.test(value.at) || new Date(value.at).toISOString().slice(0, 23) !== value.at.slice(0, 23)) || typeof value.id !== "string" || !uuid.test(value.id)) return null;
      cursor = { at: value.at, id: value.id, ...(value.v===2?{kind:value.kind}:{}) };
    } catch { return null; }
  }
  return { filter: filter as CreationFilter, limit, cursor };
};

export const mediaCreationId = (value:string) => value.startsWith("media:") && uuid.test(value.slice(6)) ? value.slice(6) : null;
export const creationId = (value:string) => makeupCreationId(value) ?? mediaCreationId(value);
export const encodeGlobalCreationCursor = (filter:CreationFilter,at:string,kind:"makeup"|"media",id:string) => Buffer.from(JSON.stringify({v:2,filter,at,kind,id})).toString("base64url");
