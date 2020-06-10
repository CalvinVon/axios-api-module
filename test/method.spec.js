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


    it('static method globalBefore', async () => {
        ApiModule.globalBefore((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.equal(testData);
            next();
        });

        await apiMapper.test(testData);
    });

    it('instance method useBefore', async () => {
        apiModule.useBefore((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            expect(context.data).to.be.equal(testData);
            next();
        });

        await apiMapper.test(testData);
    });

    it('instance method would override static method', async () => {
        apiModule.useBefore((context, next) => {
            expect(context).to.be.ok;
            next();
        });
        ApiModule.globalBefore((context, next) => {
            next();
        });

        await apiMapper.test(testData);
    });


    it('static before method passing `null` would not throw an error', async () => {
        ApiModule.globalBefore(null);
        await apiMapper.test(testData);
    });

    it('static before method passing `123` would not throw an error', async () => {
        ApiModule.globalBefore(123);
        await apiMapper.test(testData);
    });

    it('static before method passing undefined would not throw an error', async () => {
        ApiModule.globalBefore();
        await apiMapper.test(testData);
    });

    it('instance before method passing undefined would not throw an error', async () => {
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

    it('static after method globalAfter', async () => {
        ApiModule.globalAfter((context, next) => {
            expect(context.metadata).to.be.not.equal(testMetadata);
            expect(context.metadata).to.be.eql(testMetadata);
            next();
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });

    it('instance after method useAfter', async () => {
        apiModule.useAfter((context, next) => {
            expect(context.metadata).to.be.eql(testMetadata);
            next();
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });

    it('instance after method would override static method', async () => {
        apiModule.useAfter((context, next) => {
            next();
        });
        ApiModule.globalAfter((context, next) => {
            next(new Error('It should not go here.'));
        });

        const res = await apiMapper.test(testData);
        expect(res).to.be.eql(testData.body);
    });


    it('static after method passing `null` would not throw an errors', async () => {
        ApiModule.globalAfter(null);
        await apiMapper.test(testData);
    });

    it('static after method passing `123` would not throw an error', async () => {
        ApiModule.globalAfter(123);
        await apiMapper.test(testData);
    });

    it('static after method passing undefined would not throw an error', async () => {
        ApiModule.globalAfter();
        await apiMapper.test(testData);
    });

    it('instance after method passing undefined would not throw an error', async () => {
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
                timeout: 0
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

    it('static catch method useCatch', async () => {
        const middlewareError = new Error('I made a mistake');
        ApiModule.globalBefore((context, next) => {
            // context.setError();
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

    it('instance catch method useCatch', async () => {
        const middlewareError = new Error('I made a mistake');
        apiModule.useBefore((context, next) => {
            // context.setError();
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


    it('instance catch method would override static method', async () => {
        const error = new Error('A mistake');
        const anthorError = new Error('Anthor mistake');

        apiModule.useBefore((context, next) => {
            next(error);
        });
        apiModule.useCatch((context, next) => {
            expect(context.responseError).to.be.equal(error);
            context.setError(anthorError);
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

    it('static catch method passing `null` would not throw an error', async () => {
        ApiModule.globalCatch(null);
        apiModule.useBefore((context, next) => {
            next('error');
        });
        try {
            apiMapper.test(testData)
            expect(1).to.be.ok;
        } catch (error) {
            throw 'It should not go here';
        }
    });

    it('static catch method passing `123` would not throw an error', async () => {
        ApiModule.globalCatch(123);
        apiModule.useBefore((context, next) => {
            next('error');
        });
        try {
            apiMapper.test(testData)
            expect(1).to.be.ok;
        } catch (error) {
            throw 'It should not go here';
        }
    });

    it('static catch method passing undefined would not throw an error', async () => {
        ApiModule.globalCatch();
        apiModule.useBefore((context, next) => {
            next('error');
        });
        try {
            apiMapper.test(testData)
            expect(1).to.be.ok;
        } catch (error) {
            throw 'It should not go here';
        }
    });

    it('instance catch method passing undefined would not throw an error', async () => {
        apiModule.useCatch();
        expect(true).to.be.ok;
    });

});