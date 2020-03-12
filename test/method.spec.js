import chai, { expect } from 'chai';
import utils from './utils';
import ApiModule from '../src';


function cleanHooks() {
    ApiModule.foreRequestHook = null;
    ApiModule.postRequestHook = null;
    ApiModule.fallbackHook = null;
}


describe('useBefore methods', () => {
    let server;
    let testMetadata,
        testData,
        apiModule,
        apiMapper;

    before('Setup server', done => {
        server = utils.createServer(7788);
        server.on('listening', () => {
            done();
        });
    });

    after('Stop and clean server', done => {
        server.on('close', () => {
            server = null;
            done();
        });

        cleanHooks();
        server.close();
    });

    beforeEach(() => {
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
    });

    afterEach(() => {
        cleanHooks();
    });


    it('static method globalBefore', () => {
        ApiModule.globalBefore((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.equal(testData);
            next();
        });

        apiMapper.test(testData);
    });

    it('instance method useBefore', () => {
        apiModule.useBefore((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.equal(testData);
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
        server.on('listening', () => {
            done();
        });
    });

    after('Stop and clean server', done => {
        server.on('close', () => {
            server = null;
            done();
        });
        server.close();
        cleanHooks();
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
        cleanHooks();
    });

    it('static method globalAfter', async () => {
        ApiModule.globalAfter((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            next();
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });

    it('instance method useAfter', async () => {
        apiModule.useAfter((context, next) => {
            expect(context.metadata).to.be.eql(testMetadata);
            next();
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });

    it('instance method would override static method', async () => {
        apiModule.useAfter((context, next) => {
            next();
        });
        ApiModule.globalAfter((context, next) => {
            next(new Error('It should not go here.'));
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
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
        apiModule.useAfter();
        await apiMapper.test(testData);
    });

});

describe('useCatch methods', () => {
    let server;
    let testMetadata,
        testData,
        apiModule,
        apiMapper;


    before('Setup server', done => {
        server = utils.createServer(7788);
        server.on('listening', () => {
            done();
        });
    });

    after('Stop and clean server', done => {
        server.on('close', () => {
            server = null;
            done();
        });
        server.close();
        cleanHooks();
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
                // a typo error on purpose
                baseURL: 'http://localhost:7789',
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
        cleanHooks();
    });

    it('static method useCatch', async () => {
        const middlewareError = new Error('I made a mistake');
        ApiModule.globalBefore((context, next) => {
            // context.setResponseError();
            next(middlewareError);
        });
        ApiModule.globalCatch((context, next) => {
            expect(context.metadata).to.be.deep.equal(testMetadata);
            expect(context.data).to.be.deep.equal(testData);
            expect(context.responseError).to.be.equal(middlewareError);
            next();
        });

        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error).to.be.equal(middlewareError);
        }
    });

    it('instance method useCatch', async () => {
        const middlewareError = new Error('I made a mistake');
        apiModule.useBefore((context, next) => {
            // context.setResponseError();
            next(middlewareError);
        });
        apiModule.useCatch((context, next) => {
            expect(context.metadata).to.be.deep.equal(testMetadata);
            expect(context.data).to.be.deep.equal(testData);
            expect(context.responseError).to.be.equal(middlewareError);
            next();
        });

        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error).to.be.equal(middlewareError);
        }
    });


    it('instance method would override static method', async () => {
        const error = new Error('A mistake');
        const anthorError = new Error('Anthor mistake');

        apiModule.useBefore((context, next) => {
            next(error);
        });
        apiModule.useCatch((context, next) => {
            expect(context.responseError).to.be.equal(error);
            context.setResponseError(anthorError);
            next();
        });
        ApiModule.globalCatch((context, next) => {
            throw 'It should not go here';
            next();
        });

        try {
            await apiMapper.test(testData);
        } catch (err) {
            expect(err).to.be.equal(anthorError);
            expect(err).to.be.not.equal(error);
        }
    });

    it('static method passing `null` would not throw an error', async () => {
        ApiModule.globalCatch(null);
        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error.message).to.be.match(/(connect ECONNREFUSED|timeout)/);
        }
    });

    it('static method passing `123` would not throw an error', async () => {
        ApiModule.globalCatch(123);
        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error.message).to.be.match(/(connect ECONNREFUSED|timeout)/);
        }
    });

    it('static method passing undefined would not throw an error', async () => {
        ApiModule.globalCatch();
        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error.message).to.be.match(/(connect ECONNREFUSED|timeout)/);
        }
    });

    it('instance method passing undefined would not throw an error', async () => {
        apiModule.useCatch();
        try {
            await apiMapper.test(testData);
        } catch (error) {
            expect(error.message).to.be.match(/(connect ECONNREFUSED|timeout)/);
        }
    });

});