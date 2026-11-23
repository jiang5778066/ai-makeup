import {it,expect} from 'vitest';
import {validateInputSpec} from './media-inputs';
it('新媒体8MiB且严格白名单，不复用旧自拍12MiB',()=>{expect(()=>validateInputSpec({contentType:'image/png',contentLength:8388609,sha256:'a'.repeat(64),purpose:'reference_image'})).toThrow();expect(()=>validateInputSpec({contentType:'image/png',contentLength:10,sha256:'a'.repeat(64),purpose:'reference_image',key:'伪造'})).toThrow()});

import {vi} from 'vitest';
import {createMediaInputs} from './media-inputs';
import type {MediaStore} from './media-persistence';
import type {InputRecord} from './media-contracts';
import type {MediaObjectStorage} from './media-storage';
it('匿名或非所有者不能取得上传授权，已封存输入也不能重签',async()=>{
 const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const record={id,user_id:owner,staging_key:`media/staging/${owner}/${id}`,expected_mime:'image/png',status:'uploading',expires_at:new Date(86401000).toISOString()} as InputRecord;
 const signUpload=vi.fn(async()=>({backend:'supabase' as const,method:'PUT' as const,uploadUrl:'https://fixture.invalid/?token=synthetic',objectKey:record.staging_key,requiredHeaders:{'Content-Type':'image/png'},expiresAt:new Date(7201000).toISOString()}));
 const objects={signUpload} as unknown as MediaObjectStorage,store={input:async(user:string)=>user===owner?record:null} as unknown as MediaStore;
 const inputs=createMediaInputs(store,objects,async()=>{throw Error('不应解码')},()=>1000);
 await expect(inputs.sign('',id)).rejects.toThrow('unauthorized');await expect(inputs.sign('other',id)).rejects.toThrow('not_found');expect(signUpload).not.toHaveBeenCalled();
 const dto=await inputs.sign(owner,id);expect(dto.version).toBe(2);expect(dto.expiresAt).toBe(new Date(7201000).toISOString());expect(dto.expiresAt).not.toBe(new Date(301000).toISOString());expect(signUpload).toHaveBeenCalledWith(record.staging_key,'image/png',owner);
 record.status='ready';await expect(inputs.sign(owner,id)).rejects.toThrow('input_not_uploadable');
});
