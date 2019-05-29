import chai, { expect } from 'chai';
import ApiModule from '../src';
import utils from './utils';

describe('foreRequestMiddleWare methods', () => {
    let server;
    let testApiMeta,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        server = utils.createServer(1111);
        server.on('listening', done);
    });

    after('Stop and clean server', () => {
        server.close();
        server = null;
    });

    beforeEach('Setup ApiModule', () => {
        testApiMeta = {
            url: '/api/test',
            method: 'get',
            name: 'test middleware methods'
        };
        testData = {
            query: {
                a: 1,
                b: 2
            },
            body: {
                c: 11,
                d: 22
            }
        };
        apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:1111'
            },
            module: false,
            apiMetas: {
                test: testApiMeta
            }
        });

        apiMapper = apiModule.getInstance();
    });

    it('static method registerForeRequestMiddleWare', done => {
        ApiModule.globalForeRequestMiddleWare((apiMeta, data, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            next();
        });

        apiMapper.test(testData).then(() => done());
    });

    it('instance method registerForeRequestMiddleWare', done => {
        apiModule.registerForeRequestMiddleWare((apiMeta, data, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            next();
        });

        apiMapper.test(testData).then(() => done());
    });

    it('instance method would override static method', done => {
        apiModule.registerForeRequestMiddleWare((apiMeta, data, next) => {
            next();
        });
        ApiModule.globalForeRequestMiddleWare((apiMeta, data, next) => {
            next();
            expect.fail();
        });
        apiMapper.test(testData).then(() => done());
    });

    // it('static method registerForeRequestMiddleWare')
});

describe('fallbackMiddleWare methods', () => {
    let server;
    let testApiMeta,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        server = utils.createServer(1111);
        server.on('listening', done);
    });

    after('Stop and clean server', () => {
        server.close();
        server = null;
    });


    beforeEach('Setup ApiModule', () => {
        testApiMeta = {
            url: '/api/test',
            method: 'get',
            name: 'test middleware methods'
        };
        testData = {
            query: {
                a: 1,
                b: 2
            },
            body: {
                c: 11,
                d: 22
            }
        };
        apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:2222',
                timeout: 1000
            },
            module: false,
            console: true,
            apiMetas: {
                test: testApiMeta
            }
        });

        apiMapper = apiModule.getInstance();
    });

    it('static method registerFallbackMiddleWare', () => {
        let middleware_error;
        ApiModule.globalFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            middleware_error = error;
            next(error);
        });
        
        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

    it('instance method registerFallbackMiddleWare', () => {
        let middleware_error;
        apiModule.registerFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            middleware_error = error;
            next(error);
        });

        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

    it('instance method would override static method', () => {
        let middleware_error;
        apiModule.registerFallbackMiddleWare((apiMeta, { error }, next) => {
            middleware_error = error;
            next(error);
        });
        ApiModule.globalFallbackMiddleWare((apiMeta, { error }, next) => {
            next(error);
            expect.fail();
        });
        
        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

});