import { createHash,createHmac,randomUUID,timingSafeEqual } from 'node:crypto';
import { MediaFault, type MediaEconomics, type MediaQuote } from './media-contracts';
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export const canonicalHash=(v:unknown)=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
export function validateEconomics(e:MediaEconomics) {
 if(!e||![e.credits,e.providerUpperCents,e.dailyCapCents].every(x=>Number.isSafeInteger(x)&&x>0)||e.providerUpperCents>e.dailyCapCents||![e.tariffVersion,e.budgetApprovalRef,e.providerAccountRef].every(x=>typeof x==='string'&&x.length>0&&x.length<=160))throw new MediaFault('media_pricing_unavailable',503);
}
export function createQuoteSigner(key:Buffer,now:()=>number=Date.now) {
 if(key.length<32)throw new MediaFault('media_quotes_unconfigured',503);
 const mac=(v:string)=>createHmac('sha256',key).update(v).digest();
 return {
  issue(userId:string,payloadHash:string,economics:MediaEconomics) {
   validateEconomics(economics);
   const body=Buffer.from(JSON.stringify({...economics,version:1,quoteId:randomUUID(),userId,payloadHash,expiresAt:now()+300000} satisfies MediaQuote)).toString('base64url');
   return `${body}.${mac(body).toString('base64url')}`;
  },
  verify(token:string,userId:string,payloadHash:string,allowExpired=false):MediaQuote {
   if(typeof token!=='string'||token.length>4096)throw new MediaFault('invalid_quote');
   const [body,sig,...extra]=token.split('.');const supplied=Buffer.from(sig??'','base64url');const expected=mac(body??'');
   if(extra.length||!body||supplied.length!==expected.length||!timingSafeEqual(supplied,expected))throw new MediaFault('invalid_quote');
   let q:MediaQuote;try{q=JSON.parse(Buffer.from(body,'base64url').toString())}catch{throw new MediaFault('invalid_quote')}
   if(q.version!==1||q.userId!==userId||q.payloadHash!==payloadHash||!Number.isSafeInteger(q.expiresAt))throw new MediaFault('invalid_quote');
   validateEconomics(q);if(!allowExpired&&q.expiresAt<=now())throw new MediaFault('quote_expired');return q;
  }
 };
}
export type QuoteSigner=ReturnType<typeof createQuoteSigner>;
export const quoteEconomics=(q:MediaEconomics):MediaEconomics=>({tariffVersion:q.tariffVersion,credits:q.credits,providerUpperCents:q.providerUpperCents,budgetApprovalRef:q.budgetApprovalRef,dailyCapCents:q.dailyCapCents,providerAccountRef:q.providerAccountRef});
