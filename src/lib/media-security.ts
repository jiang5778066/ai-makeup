import {isIP} from 'node:net';
import {MediaFault} from './media-contracts';
export const MEDIA_INPUT_MAX=8*1024*1024;
export function assertMediaUrl(value:string,hosts:readonly string[]){
 let url:URL;try{url=new URL(value)}catch{throw new MediaFault('unsafe_media_url')}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash||isIP(url.hostname)||!hosts.includes(url.hostname.toLowerCase()))throw new MediaFault('unsafe_media_url');return url;
}
export function publicMediaAddress(value:string){
 if(isIP(value)===4){const [a,b]=value.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51)||a===203&&b===0)}
 // 首版未核IPv6特殊用途分类，全部拒绝IPv6；不假称已验证全球地址。
 return false;
}
export async function readBounded(stream:AsyncIterable<Uint8Array>,max:number){
 const chunks:Buffer[]=[];let bytes=0;for await(const chunk of stream){bytes+=chunk.byteLength;if(bytes>max)throw new MediaFault('media_too_large');chunks.push(Buffer.from(chunk))}return Buffer.concat(chunks);
}
export function sniffMediaMime(b:Buffer):string|null{
 if(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.toString('ascii',12,16)==='IHDR')return 'image/png';
 if(b.length>=4&&b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217)return 'image/jpeg';
 if(b.length>=16&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'&&b.readUInt32LE(4)+8===b.length)return 'image/webp';
 if(b.length>=16&&b.toString('ascii',4,8)==='ftyp')return 'video/mp4';
 if(b.length>=4&&b.subarray(0,4).equals(Buffer.from([26,69,223,163])))return 'video/webm';return null;
}
export type DecodedMedia={mime:string;width:number;height:number;frames:number;durationMs?:number;container?:string;codec?:string;streams?:number};
export type MediaDecoder=(bytes:Buffer,mime:string)=>Promise<DecodedMedia>;
export async function verifyDecoded(bytes:Buffer,mime:string,decode:MediaDecoder){
 if(sniffMediaMime(bytes)!==mime)throw new MediaFault('media_mime_mismatch');
 const m=await decode(bytes,mime);
 if(m.mime!==mime||![m.width,m.height,m.frames].every(Number.isSafeInteger)||m.width<1||m.height<1||m.width>8192||m.height>8192||m.width*m.height>32000000||m.frames<1||mime.startsWith('image/')&&m.frames!==1)throw new MediaFault('media_decode_rejected');return m;
}
export interface PinnedTransport {
 resolve(host:string):Promise<{address:string;family:4|6}[]>;
 // 必须仅连接传入address，TLS验证url.hostname，禁止重定向和二次DNS；E2/E3独立审验真实实现。
 request(url:URL,address:{address:string;family:4|6},max?:number):Promise<{status:number;contentType:string;body:AsyncIterable<Uint8Array>}>;
}
export function createMediaDownloader(hosts:readonly string[],transport:PinnedTransport){return async(value:string,max:number)=>{
 const url=assertMediaUrl(value,hosts),addresses=await transport.resolve(url.hostname);
 if(!addresses.length||addresses.some(a=>!publicMediaAddress(a.address)||isIP(a.address)!==a.family))throw new MediaFault('unsafe_media_address');
 const r=await transport.request(url,addresses[0],max);if(r.status===401||r.status===403)throw new MediaFault('media_download_expired');if(r.status!==200)throw new MediaFault('media_download_rejected');
 return {bytes:await readBounded(r.body,max),mime:r.contentType.split(';')[0].trim().toLowerCase()};
}}
