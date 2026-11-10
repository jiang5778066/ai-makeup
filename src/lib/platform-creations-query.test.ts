import {it,expect} from 'vitest';
import {parseCreationQuery} from './platform-creations-query';
it('接收v2跨kind六位微秒且v1继续兼容美妆',()=>{
 const token=Buffer.from(JSON.stringify({v:2,filter:'all',at:'2026-11-09T12:00:00.123456Z',kind:'media',id:'00000000-0000-4000-8000-000000000001'})).toString('base64url');
 expect(parseCreationQuery(new URL(`https://app.test/api/creations?cursor=${token}`))?.cursor).toEqual({at:'2026-11-09T12:00:00.123456Z',kind:'media',id:'00000000-0000-4000-8000-000000000001'});
});
