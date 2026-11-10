import {it,expect} from 'vitest';
import {validateInputSpec} from './media-inputs';
it('新媒体8MiB且严格白名单，不复用旧自拍12MiB',()=>{expect(()=>validateInputSpec({contentType:'image/png',contentLength:8388609,sha256:'a'.repeat(64),purpose:'reference_image'})).toThrow();expect(()=>validateInputSpec({contentType:'image/png',contentLength:10,sha256:'a'.repeat(64),purpose:'reference_image',key:'伪造'})).toThrow()});
