import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ApiModule from '../src';

chai.use(chaiAsPromised);
chai.should();

// const apiMod = new ApiModule({
//     module: false,
//     apiMetas: {
//         test: {
//             url: 'not.exsit.com',
//             name: 'test request',
//             method: 'get'
//         }
//     }
// });

// const apis = apiMod.getInstance();

describe('ApiModule', () => {
    
});