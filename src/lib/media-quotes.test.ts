import { describe,it,expect } from 'vitest';
import { createQuoteSigner, canonicalHash } from './media-quotes';
const user='11111111-1111-4111-8111-111111111111';
const economics={tariffVersion:'synthetic-only',credits:2,providerUpperCents:3,budgetApprovalRef:'isolated-test',dailyCapCents:30,providerAccountRef:'synthetic'};
describe('可信媒体报价',()=>{
 it('确定性规范JSON不受对象键顺序影响',()=>expect(canonicalHash({b:1,a:{d:2,c:3}})).toBe(canonicalHash({a:{c:3,d:2},b:1})));
 it('签名绑定本人/请求/经济身份并拒绝过期和篡改',()=>{const signer=createQuoteSigner(Buffer.alloc(32,7),()=>1000);const token=signer.issue(user,'hash',economics);expect(signer.verify(token,user,'hash',false).credits).toBe(2);expect(()=>signer.verify(token,'other','hash',false)).toThrow();expect(()=>signer.verify(token,user,'changed',false)).toThrow();expect(()=>signer.verify(token+'x',user,'hash',false)).toThrow();expect(()=>createQuoteSigner(Buffer.alloc(32,7),()=>400001).verify(token,user,'hash',false)).toThrow('quote_expired')});
 it('只允许已存在同意图重放分支验证过期签名，不创建新报价',()=>{const first=createQuoteSigner(Buffer.alloc(32,7),()=>0);const token=first.issue(user,'hash',economics);expect(createQuoteSigner(Buffer.alloc(32,7),()=>400000).verify(token,user,'hash',true).credits).toBe(2)});
});
