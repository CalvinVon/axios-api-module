import chai, { expect } from 'chai';
import utils from './utils';
import ApiModule from '../src';


describe('useBefore methods', () => {
    let server;
    let testMetadata,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        testMetadata = {
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
                baseURL: 'http://localhost:7788'
            },
            module: false,
            metadatas: {
                test: testMetadata
            }
        });

        apiMapper = apiModule.getInstance();

        server = utils.createServer(7788);
        server.on('listening', () => {
            done();
        });
    });

    after('Stop and clean server', done => {
        server.on('close', () => {
            done();
        });
        server = null;
        // ApiModule.foreRequestHook = null;
        server.close();
    });


    it('static method globalBefore', () => {
        ApiModule.globalBefore((context, next) => {
            expect(context.metadata).to.be.not.eq(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.eq(testData);
            next();
        });

        apiMapper.test(testData);
    });

    it('instance method useBefore', () => {
        apiModule.useBefore((context, next) => {
            expect(context.metadata).to.be.not.eq(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.eq(testData);
            next();
        });

        apiMapper.test(testData)
    });

    it('instance method would override static method', () => {
        apiModule.useBefore((context, next) => {
            next();
        });
        ApiModule.globalBefore((context, next) => {
            next();
        });

        apiMapper.test(testData);
    });


    it('static method passing `null` would not throw an error', async () => {
        ApiModule.globalBefore(null);
        await apiMapper.test(testData);
    });

    it('static method passing `123` would not throw an error', async () => {
        ApiModule.globalBefore(123);
        await apiMapper.test(testData);
    });

    it('static method passing undefined would not throw an error', async () => {
        ApiModule.globalBefore();
        await apiMapper.test(testData);
    });

    it('instance method passing undefined would not throw an error', async () => {
        apiModule.useBefore();
        await apiMapper.test(testData);
    });

    it('passed some error then reject the request', (done) => {
        apiModule.useBefore((context, next) => {
            next(new Error('some thing happened'));
        });

        apiMapper.test(testData)
            .catch(err => {
                done();
            })
    })
});

describe('useAfter methods', () => {
    let server;
    let testMetadata,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        server = utils.createServer(7788, (req, res) => {
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
        testMetadata = {
            url: '/api/test',
            method: 'get',
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
                baseURL: 'http://localhost:7788'
            },
            module: false,
            metadatas: {
                test: testMetadata
            }
        });

        apiMapper = apiModule.getInstance();
        apiModule.getAxios().interceptors.response.use(response => {
            return response.data.data;
        });
    });

    afterEach('Clean ApiModule', () => {
        testMetadata = null;
        testData = null;
        apiModule = null;
        apiMapper = null;
    });

    it('static method globalAfter', async () => {
        ApiModule.globalAfter((context, next) => {
            expect(context.metadatas).to.be.eql(testMetadata);
            next(response);
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });

    it('instance method registeruseAfter', () => {
        apiModule.registeruseAfter((apiMeta, { response }, next) => {
            expect(apiMeta).to.be.eq(testMetadata);
            next(response);
        });

        return apiMapper.test(testData).should.eventually.deep.eq(testData.body);
    });

    it('instance method would override static method', () => {
        apiModule.registeruseAfter((apiMeta, { response }, next) => {
            next(response);
        });
        ApiModule.globalAfter((apiMeta, responseWrapper, next) => {
            next();
        });
        return apiMapper.test(testData).should.eventually.deep.eq(testData.body);
    });


    it('static method passing `null` would not throw an errors', async () => {
        ApiModule.globalAfter(null);
        await apiMapper.test(testData);
    });

    it('static method passing `123` would not throw an error', async () => {
        ApiModule.globalAfter(123);
        await apiMapper.test(testData);
    });

    it('static method passing undefined would not throw an error', async () => {
        ApiModule.globalAfter();
        await apiMapper.test(testData);
    });

    it('instance method passing undefined would not throw an error', async () => {
        apiModule.registeruseAfter();
        await apiMapper.test(testData);
    });

});

describe('fallbackMiddleWare methods', () => {
    let server;
    let testMetadata,
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
        testMetadata = {
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
            metadatas: {
                test: testMetadata
            }
        });

        apiMapper = apiModule.getInstance();
    });

    afterEach('Clean ApiModule', () => {
        testMetadata = null;
        testData = null;
        apiModule = null;
        apiMapper = null;
    });

    it('static method registerFallbackMiddleWare', () => {
        let middleware_error;
        ApiModule.globalFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.deep.eq(testMetadata);
            expect(data).to.be.deep.eq(testData);
            middleware_error = error;
            next(error);
        });

        return apiMapper.test(testData).should.be.rejectedWith(middleware_error);
    });

    it('instance method registerFallbackMiddleWare', () => {
        let middleware_error;
        apiModule.registerFallbackMiddleWare((apiMeta, { data, error }, next) => {
            expect(apiMeta).to.be.deep.eq(testMetadata);
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