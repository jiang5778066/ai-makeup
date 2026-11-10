import { privateJson, sameOrigin } from "./platform-account-http";
import { creationId, parseCreationQuery } from "./platform-creations-query";
import type { CreationSource } from "./platform-creations-types";
export type CreationDependencies = { currentUser: () => Promise<{ id: string } | null>; ready: () => boolean; source: CreationSource };
export const createCreationHandlers = (deps: CreationDependencies) => {
  const execute = async (run: (userId: string) => Promise<Response>) => {
    try {
      const user = await deps.currentUser();
      if (!user) return privateJson({ code: "unauthorized" }, 401);
      if (!deps.ready()) return privateJson({ code: "creations_unavailable" }, 503);
      return await run(user.id);
    } catch { return privateJson({ code: "creations_unavailable" }, 503); }
  };
  return {
    list: (request: Request) => execute(async (userId) => {
      const sources=deps.source.connectionState?await deps.source.connectionState():{makeup:"connected",media:"not_connected"};
      if(deps.source.connectionState && (sources.makeup!=="connected"||sources.media!=="connected"))return privateJson({code:"creations_unavailable",sources},503);
      const query = parseCreationQuery(new URL(request.url));
      if (!query) return privateJson({ code: "invalid_query" }, 400);
      if (query.cursor && !await deps.source.validateCursor?.(userId, query.cursor)) return privateJson({ code: "invalid_cursor" }, 400);
      return privateJson({ version: 1, ...await deps.source.list(userId, query), sources });
    }),
    read: (_request: Request, id: string) => execute(async (userId) => {
      if (!creationId(id)) return privateJson({ code: "not_found" }, 404);
      const item = await deps.source.read(userId, id);
      return item ? privateJson(item) : privateJson({ code: "not_found" }, 404);
    }),
    remove: (request: Request, id: string) => execute(async (userId) => {
      if (!sameOrigin(request)) return privateJson({ code: "origin_rejected" }, 403);
      if (!creationId(id)) return privateJson({ code: "not_found" }, 404);
      const result = await deps.source.remove(userId, id);
      if (result === "not_found") return privateJson({ code: "not_found" }, 404);
      if (result === "in_progress") return privateJson({ code: "creation_in_progress" }, 409);
      return privateJson({ removed: true });
    })
  };
};
