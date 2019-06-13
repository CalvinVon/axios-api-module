import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import utils from './utils';
import ApiModule from '../src';

chai.use(chaiAsPromised);
chai.should();

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

    after('Stop and clean server', done => {
        server.on('close', done);
        server.close();
        server = null;
        ApiModule.foreRequestHook = null;
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

    afterEach('Clean ApiModule', () => {
        testApiMeta = null;
        testData = null;
        apiModule = null;
        apiMapper = null;
    });

    it('static method globalForeRequestMiddleWare', () => {
        ApiModule.globalForeRequestMiddleWare((apiMeta, data, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            next();
        });

        return apiMapper.test(testData);
    });

    it('instance method globalForeRequestMiddleWare', () => {
        apiModule.registerForeRequestMiddleWare((apiMeta, data, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            expect(data).to.be.eq(testData);
            next();
        });

        return apiMapper.test(testData);
    });

    it('instance method would override static method', () => {
        apiModule.registerForeRequestMiddleWare((apiMeta, data, next) => {
            next();
        });
        ApiModule.globalForeRequestMiddleWare((apiMeta, data, next) => {
            next();
        });
        return apiMapper.test(testData);
    });


    it('static method passing `null` would not throw an error', () => {
        ApiModule.globalForeRequestMiddleWare(null);
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('static method passing `123` would not throw an error', () => {
        ApiModule.globalForeRequestMiddleWare(123);
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('static method passing undefined would not throw an error', () => {
        ApiModule.globalForeRequestMiddleWare();
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('instance method passing undefined would not throw an error', () => {
        apiModule.registerForeRequestMiddleWare();
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('passed some error then reject the request', () => {
        apiModule.registerForeRequestMiddleWare((_, __, next) => {
            next(new Error('some thing happened'));
        });

        return apiMapper.test(testData).should.be.rejectedWith('some thing happened');
    })
});

describe('postRequestMiddleWare methods', () => {
    let server;
    let testApiMeta,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        server = utils.createServer(1111, (req, res) => {
            let rawData = '';
            req.on('data', chunk => rawData += chunk);
            req.on('end', () => {
                const data = JSON.parse(rawData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ code: 200, data }));
            });

            // prevent default response action
            return true;
        });
        server.on('listening', done);
    });

    after('Stop and clean server', done => {
        server.on('close', done);
        server.close();
        server = null;
        ApiModule.foreRequestHook = null;
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
        apiModule.getAxios().interceptors.response.use(response => {
            return response.data.data;
        });
    });

    afterEach('Clean ApiModule', () => {
        testApiMeta = null;
        testData = null;
        apiModule = null;
        apiMapper = null;
    });

    it('static method globalPostRequestMiddleWare', () => {
        ApiModule.globalPostRequestMiddleWare((apiMeta, res, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            next(res);
        });

        return apiMapper.test(testData).should.eventually.deep.eq(testData.body);
    });

    it('instance method registerPostRequestMiddleWare', () => {
        apiModule.registerPostRequestMiddleWare((apiMeta, res, next) => {
            expect(apiMeta).to.be.eq(testApiMeta);
            next(res);
        });

        return apiMapper.test(testData).should.eventually.deep.eq(testData.body);
    });

    it('instance method would override static method', () => {
        apiModule.registerPostRequestMiddleWare((apiMeta, res, next) => {
            next(res);
        });
        ApiModule.globalPostRequestMiddleWare((apiMeta, res, next) => {
            next();
        });
        return apiMapper.test(testData).should.eventually.deep.eq(testData.body);
    });


    it('static method passing `null` would not throw an errors', () => {
        ApiModule.globalPostRequestMiddleWare(null);
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('static method passing `123` would not throw an error', () => {
        ApiModule.globalPostRequestMiddleWare(123);
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('static method passing undefined would not throw an error', () => {
        ApiModule.globalPostRequestMiddleWare();
        return apiMapper.test(testData).should.be.fulfilled;
    });

    it('instance method passing undefined would not throw an error', () => {
        apiModule.registerPostRequestMiddleWare();
        return apiMapper.test(testData).should.be.fulfilled;
    });

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

    after('Stop and clean server', done => {
        server.on('close', done);
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

    afterEach('Clean ApiModule', () => {
        testApiMeta = null;
        testData = null;
        apiModule = null;
        apiMapper = null;
    });

    it('static method registerFallbackMiddleWare', () => {
        let middleware_error;
        ApiModule.globalFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.deep.eq(testApiMeta);
            expect(data).to.be.deep.eq(testData);
            middleware_error = error;
            next(error);
        });

        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

    it('instance method registerFallbackMiddleWare', () => {
        let middleware_error;
        apiModule.registerFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.deep.eq(testApiMeta);
            expect(data).to.be.deep.eq(testData);
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
        });

        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

    it('static method passing `null` would not throw an error', () => {
        ApiModule.globalFallbackMiddleWare(null);
        return apiMapper.test(testData).should.be.rejectedWith(/(connect ECONNREFUSED|timeout)/);
    });

    it('static method passing `123` would not throw an error', () => {
        ApiModule.globalFallbackMiddleWare(123);
        return apiMapper.test(testData).should.be.rejectedWith(/(connect ECONNREFUSED|timeout)/);
    });

    it('static method passing undefined would not throw an error', () => {
        ApiModule.globalFallbackMiddleWare();
        return apiMapper.test(testData).should.be.rejectedWith(/(connect ECONNREFUSED|timeout)/);
    });

    it('instance method passing undefined would not throw an error', () => {
        apiModule.registerFallbackMiddleWare();
        return apiMapper.test(testData).should.be.rejectedWith(/(connect ECONNREFUSED|timeout)/);
    });

});