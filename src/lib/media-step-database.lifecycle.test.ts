// @vitest-environment node
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {expect,it} from 'vitest';
const run=promisify(execFile);
for(const mode of ['unused','tcp','ssl','tls','failure','reject','normal','retry','deadline','handoff-close','handoff-abort']){
 it(`真实postgres与Node TLS零网络生命周期：${mode}`,async()=>{
  const {stdout}=await run(process.execPath,['node_modules/tsx/dist/cli.mjs',fileURLToPath(new URL('./media-step-database.lifecycle.fixture.mts',import.meta.url)),mode],{timeout:4000});
  expect(JSON.parse(stdout)).toMatchObject({mode,allClosed:true,actualPostgres:true,networkConnections:0});
 },6000);
}
