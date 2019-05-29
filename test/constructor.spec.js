import chai, { expect } from 'chai';
import ApiModule from '../src';

describe('baseConfig', () => {

    it('options of instance contain original config', () => {
        const config = {
            baseConfig: {
                baseURL: 'http://api.yourdomain.com',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-test-header': 'api-module'
                },
                withCredentials: true,
                timeout: 60000
            },
            console: false,
            module: false,
            apiMetas: {}
        };
        const apiModule = new ApiModule(config);
        expect(apiModule.options).to.be.contain(config);
    });

    it('api mapper contains \'$module\' property that refs to ApiModule instance', () => {
        const apiModule = new ApiModule();
        const apiMapper = apiModule.getInstance();
        expect(apiMapper).to.has.ownProperty('$module');
        expect(apiMapper['$module']).to.be.eq(apiModule);
    });

    it('no modular namespace api metas', () => {
        const apiModule = new ApiModule({
            module: false,
            apiMetas: {
                test: {
                    url: '/api/test',
                    method: 'get'
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        expect(apiMapper).to.have.all.keys('test');
    });

    it('multiple modular namespaces api metas', () => {
        const apiModule = new ApiModule({
            module: true,
            apiMetas: {
                main: {
                    test: {
                        url: '/api/test',
                        method: 'get'
                    }
                },
                sub: {
                    subTest: {
                        url: '/sub/test',
                        method: 'get'
                    }
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        expect(apiMapper).to.have.all.keys('main', 'sub').but.not.have.all.keys('test', 'subTest');
    });

    it('apiMetas passing empty meta value should throw error', () => {
        const produceEmptyMeta = () => {
            new ApiModule({
                module: false,
                apiMetas: {
                    test: {},
                }
            });
        };
        const produceNullMeta = () => {
            new ApiModule({
                module: false,
                apiMetas: {
                    other: null,
                }
            });
        };
        const produceUndefinedMeta = () => {
            new ApiModule({
                module: false,
                apiMetas: {
                    another: undefined
                }
            });
        };

        expect(produceEmptyMeta).to.throw(Error, /Api meta \[(\w+)\]: 'method' or 'url' value not found/);
        expect(produceNullMeta).to.throw(TypeError, /Api meta \[(\w+)\] is not an object/);
        expect(produceUndefinedMeta).to.throw(TypeError, /Api meta \[(\w+)\] is not an object/);
    });

});