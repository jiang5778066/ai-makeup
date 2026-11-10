import type { Generation } from "@/db/schema";
import type { CreationDTO, CreationResult, CreationStatus } from "./platform-creations-types";
type MakeupRow = Pick<Generation, "id" | "status" | "mode" | "styleId" | "resultKey" | "error" | "createdAt" | "updatedAt">;
const known = new Set(["queued", "moderating", "running", "failed", "refunded", "done", "reconciling"]);
export const mapMakeupCreation = async (row: MakeupRow, sign: (key: string) => Promise<CreationResult | null>): Promise<CreationDTO> => {
  const pending = row.status !== "done" && ["creative_submission_pending", "creative_result_pending"].includes(row.error ?? "");
  const status: CreationStatus = pending || !known.has(row.status) ? "reconciling" : row.status as CreationStatus;
  let result: CreationResult | null = null;
  if (status === "done" && row.resultKey) {
    try { result = await sign(row.resultKey); } catch { /* 保留任务状态，用户可以重新获取结果链接。 */ }
  }
  return { version: 1, id: `makeup:${row.id}`, kind: "makeup", mediaType: "image", title: row.mode === "virtual_try_on" ? "virtual_try_on" : row.styleId, status, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), removable: ["done", "failed", "refunded"].includes(status), result };
};

export const mapMediaCreation = async(row:import('./media-contracts').TaskRecord,sign:(key:string,mime:string)=>Promise<CreationResult|null>):Promise<CreationDTO>=>{
 const statuses:Record<string,CreationStatus>={preparing:'queued',reserved:'queued',submitting:'running',waiting:'running',storing:'reconciling',reconciling:'reconciling',done:'done',failed:'failed',refunded:'refunded'};
 const status=statuses[row.status]??'reconciling';let result:CreationResult|null=null;
 if(status==='done'&&row.result_key&&row.result_mime)try{result=await sign(row.result_key,row.result_mime)}catch{/* 保留原ID重签，不改变状态。 */}
 return {version:1,id:`media:${row.id}`,kind:'media',mediaType:row.media_type,title:row.model,status,createdAt:row.created_at,updatedAt:row.updated_at,removable:['done','failed','refunded'].includes(status)&&['none','settled','refunded'].includes(row.credit_state),result};
};
