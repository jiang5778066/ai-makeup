import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "ai-makeup" });

export type GenerateRequestedEvent = {
  name: "makeup/generate.requested";
  data: { generationId: string };
};
