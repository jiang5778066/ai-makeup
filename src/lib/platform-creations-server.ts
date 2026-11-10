import { getCurrentUser } from "@/lib/supabase/server";
import { accountConfigured } from "./platform-account-http";
import { createCreationHandlers } from "./platform-creations-service";
import { createUnifiedCreationSource } from "./media-creations-source";
import {getMediaRuntime} from './media-runtime';
export const creations = createCreationHandlers({
  currentUser: async () => accountConfigured() ? getCurrentUser() : null,
  ready: () => process.env.CREATIONS_VISIBILITY_V1 === "1" && Boolean(process.env.DATABASE_URL),
  source: createUnifiedCreationSource(undefined, undefined, (key,mime)=>getMediaRuntime().storage.sign(key,mime))
});
