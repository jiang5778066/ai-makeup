import {it,expect} from 'vitest';
import {createMediaProcessor} from './media-functions';
it('后台恢复处理器提供显式可注入边界',()=>expect(createMediaProcessor).toBeTypeOf('function'));
