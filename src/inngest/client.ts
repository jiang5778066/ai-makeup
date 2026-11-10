import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "ai-makeup" });

export type GenerateRequestedEvent = {
  name: "makeup/generate.requested";
  data: { generationId: string };
};

export type MediaRequestedEvent = {name:'media/generate.requested'|'media/reconcile.requested'|'media/store.requested';data:{taskId:string;operationId:string}};
