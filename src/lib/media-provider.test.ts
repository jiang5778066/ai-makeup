import {it,expect} from 'vitest';
import {mediaProviders} from './media-provider';
it('默认无真实适配器，不能仅凭配置开放外呼',()=>expect(mediaProviders.get('gpt-image-2')).toBeUndefined());
