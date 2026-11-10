import {afterEach,it,expect,vi} from 'vitest';
import {GetObjectCommand,PutObjectCommand,type S3Client} from '@aws-sdk/client-s3';
import {putPrivateObjectOnce,UPLOAD_MAX_BYTES} from './storage';
const prior=globalThis.__r2Client;
afterEach(()=>{globalThis.__r2Client=prior});
it('新媒体条件写入不覆盖；412只允许原对象真实字节相同，旧自拍仍12MiB',async()=>{
 const bytes=Buffer.from('synthetic-media');let stored=bytes;
 const send=vi.fn(async(command:unknown)=>{if(command instanceof PutObjectCommand){expect(command.input.IfNoneMatch).toBe('*');throw {$metadata:{httpStatusCode:412}}}expect(command).toBeInstanceOf(GetObjectCommand);return {Body:(async function*(){yield stored})()}});
 globalThis.__r2Client={send} as unknown as S3Client;
 await putPrivateObjectOnce('synthetic','media/results/u/t/key',bytes,'image/png');stored=Buffer.from('different');await expect(putPrivateObjectOnce('synthetic','media/results/u/t/key',bytes,'image/png')).rejects.toThrow('media_object_conflict');expect(UPLOAD_MAX_BYTES).toBe(12*1024*1024);
});
