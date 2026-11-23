import {expect,it} from 'vitest';
import {validMediaUpload,type MediaInputUploadDTO} from './media-upload';
const host='svlhstoiirtsutmmanrn.supabase.co',owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',key=`media/staging/${owner}/${id}`;
const dto:MediaInputUploadDTO={version:2,backend:'supabase',method:'PUT',inputId:id,objectKey:key,bucket:'media-staging',uploadUrl:`https://${host}/storage/v1/object/upload/sign/media-staging/${key}?token=fixture`,requiredHeaders:{'Content-Type':'image/png'},maxBytes:8388608,expiresAt:new Date(7201000).toISOString()};
it('准确两小时PUT授权允许，不接收秘密header或扩权URL',()=>{
 expect(validMediaUpload(dto,'image/png',1,[host],1000)).toBe(true);
 for(const patch of [{method:'POST'},{backend:'unknown'},{uploadUrl:dto.uploadUrl.replace(host,'attacker.invalid')},{uploadUrl:dto.uploadUrl+'&upsert=true'},{uploadUrl:dto.uploadUrl.replace('/media-staging/','/media-results/')},{objectKey:key.replace('/staging/','/results/')},{requiredHeaders:{'Content-Type':'image/png',Authorization:'private'}},{expiresAt:new Date(7201001).toISOString()},{expiresAt:new Date(999).toISOString()},{requiredHeaders:{'Content-Type':'image/jpeg'}}])expect(validMediaUpload({...dto,...patch} as MediaInputUploadDTO,'image/png',1,[host],1000)).toBe(false);
 expect(validMediaUpload(dto,'image/png',1,[],1000)).toBe(false);
});
it('R2仍使用短期PUT和固定host、staging路径',()=>{
 const r2={...dto,backend:'r2' as const,bucket:undefined,expiresAt:new Date(301000).toISOString(),uploadUrl:`https://r2.example.com/private/${key}?X-Amz-Expires=300`};expect(validMediaUpload(r2,'image/png',1,['r2.example.com'],1000)).toBe(true);expect(validMediaUpload({...r2,expiresAt:dto.expiresAt},'image/png',1,['r2.example.com'],1000)).toBe(false);
});
