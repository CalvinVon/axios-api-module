import chai, { expect } from 'chai';
import utils from './utils';
import ApiModule from '../src';

describe('foreRequestMiddleware', () => {
    let server,
        apiModule;
    before('Setup server', done => {
        server = utils.createBounceServer(7788);
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
    });

    beforeEach(() => {
        apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:7788'
            },
            metadatas: {
                test: {
                    url: '/',
                    method: 'post'
                }
            },
            module: false
        });
    });

    afterEach(() => {
        apiModule.foreRequestHook = null;
        apiModule.postRequestHook = null;
        apiModule.fallbackHook = null;
    });


    it('foreRequestMiddleWare set another data', async () => {
        const data = { body: { a: 1, b: 2 } };
        const anotherData = { body: { c: 3, d: 4 } };
        apiModule.useBefore((context, next) => {
            expect(context.responseError).to.be.equal(null);
            expect(context.data).to.be.equal(data);
            context.setData(anotherData);
            expect(context.data).to.be.equal(anotherData);
            next();
        });


        try {
            const res = await apiModule.getInstance().test(data);
            expect(res.data).to.be.not.deep.equal(data.body);
            expect(res.data).to.be.deep.equal(anotherData.body);
        } catch (err) {
            throw 'It should not go here'
        }
    });

    it('request was success, but fore-request middleware set an error', async () => {
        const error = new Error('I am an error');

        apiModule.useBefore((context, next) => {
            expect(context.responseError).to.be.equal(null);
            context.setError(error);
            expect(context.responseError).to.be.equal(error);
            next();
        });


        try {
            await apiModule.getInstance().test();
            throw 'It should not go here';
        } catch (err) {
            expect(err).to.be.equal(error);
        }
    });

    it('the request was successful, but fore-request middleware passes an error in the `next` function', async () => {
        const error = new Error('I am an error');

        apiModule.useBefore((context, next) => {
            expect(context.responseError).to.be.equal(null);
            next(error);
            expect(context.responseError).to.be.equal(error);
        });


        try {
            await apiModule.getInstance().test();
            throw 'It should not go here';
        } catch (err) {
            expect(err).to.be.equal(error);
        }
    });

    it('`next` function parameters will override response error', async () => {
        const error = new Error('An error');
        const anotherError = 'An error';

        apiModule.useBefore((context, next) => {
            expect(context.responseError).to.be.equal(null);
            context.setError(error);
            expect(context.responseError).to.be.equal(error);
            next(anotherError);
        });

        try {
            await apiModule.getInstance().test();
        } catch (err) {
            expect(err).to.be.not.equal(error);
            expect(err).to.be.match(new RegExp(anotherError));
        }

    });

    it('fore-request middleware set a new axios options', done => {
        const token = 'Basic ' + Buffer.from('I am a token').toString('base64');
        apiModule.useBefore((context, next) => {
            context.setAxiosOptions({
                baseURL: 'http://localhost:8877',
                headers: {
                    'authorization': token
                }
            });
            next();
        });
        const server = utils.createServer(8877, (req, res) => {
            const authHeader = req.headers['authorization'];
            expect(authHeader).to.be.equal(token);

            server.on('close', () => {
                done();
            });
            server.close();
        });

        server.on('listening', async () => {
            try {
                await apiModule.getInstance().test(null);
            } catch (error) {
                throw 'It should not go here';
            }
        });
    });

    it('fore-request middleware set axios options would be override by request axios options', async () => {
        apiModule.useBefore((context, next) => {
            context.setAxiosOptions({
                baseURL: 'http://localhost:8877',
                headers: {
                    'x-custom-header': 'I am custom header'
                }
            });
            next();
        });

        try {
            const res = await apiModule.getInstance().test(null, {
                baseURL: 'http://localhost:7788'
            });

            expect(res).to.be.ok;
            expect(res.config.baseURL).to.be.equal('http://localhost:7788');
            expect(res.config.headers['x-custom-header']).to.be.equal('I am custom header');
        } catch (error) {
            console.error(error);
            throw 'It should not go here';
        }
    });


    it('fore-request middleware set illegal axios options', async () => {
        utils.overrideConsole();

        apiModule.useBefore((context, next) => {
            const produceError = () => {
                context.setAxiosOptions(null);
            };
            expect(produceError).to.throw(/configure axios options error/);
            next();
        });

        try {
            await apiModule.getInstance().test();
        } catch (error) {
            console.error(error);
        }


        utils.recoverConsole();
    });
});

describe('postRequestMiddleware', () => {
    let server,
        apiModule;
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
    });

    beforeEach(() => {
        apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:7788'
            },
            metadatas: {
                test: {
                    url: '/',
                    method: 'get'
                }
            },
            module: false
        });
    });

    afterEach(() => {
        apiModule.foreRequestHook = null;
        apiModule.postRequestHook = null;
        apiModule.fallbackHook = null;
    });


    it('the request was successful, postRequestMiddleWare set another response', async () => {
        const anotherResponse = { code: 0, list: [] };
        apiModule.useAfter((context, next) => {
            expect(context.responseError).to.be.equal(null);
            expect(context.response.data).to.be.deep.equal(utils.defaultServerRespose);
            context.response.data = anotherResponse;
            context.setResponse(context.response);
            expect(context.response.data).to.be.equal(anotherResponse);
            next();
        });


        try {
            const data = await apiModule.getInstance().test();
            expect(data.data).to.be.not.equal(utils.defaultServerRespose);
            expect(data.data).to.be.equal(anotherResponse);
        } catch (err) {
            throw 'It should not go here'
        }
    });
    it('the request was successful, post-request middleware passes an error in the `next` function', async () => {
        const error = new Error('I am an error');

        apiModule.useAfter((context, next) => {
            expect(context.responseError).to.be.equal(null);
            expect(context.response.data).to.be.deep.equal(utils.defaultServerRespose);
            next(error);
            expect(context.responseError).to.be.equal(error);
        });


        try {
            await apiModule.getInstance().test();
            throw 'It should not go here';
        } catch (err) {
            expect(err).to.be.equal(error);
        }
    });
});


describe('fallbackMiddleware', () => {
    let server,
        apiModule;
    before('Setup server', done => {
        server = utils.createBounceServer(7788);
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
    });

    beforeEach(() => {
        apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:7788'
            },
            metadatas: {
                test: {
                    url: '/',
                    method: 'post'
                }
            },
            module: false
        });
    });

    afterEach(() => {
        apiModule.foreRequestHook = null;
        apiModule.postRequestHook = null;
        apiModule.fallbackHook = null;
    });


    it('fallback middleware set another error', async () => {
        const error = new Error('I am an error');
        const serverResponse = { code: 500, message: 'Internal server error' };
        apiModule.getAxios().interceptors.response.use(response => {
            if (response.data.code === 200) {
                return response.data.data;
            }
            else {
                return Promise.reject(response.data);
            }
        });
        apiModule.useCatch((context, next) => {
            expect(context.responseError).to.be.not.equal(null);
            expect(context.responseError).to.be.deep.equal(serverResponse);
            context.setError(error);
            next();
        });


        try {
            await apiModule.getInstance().test({ body: serverResponse });
            throw 'It should not go here';
        } catch (err) {
            expect(err).to.be.not.equal(serverResponse);
            expect(err).to.be.equal(error);
        }
    });

    it('fallback middleware `next` function parameters will override response error', async () => {
        const error = new Error('I am an error');
        const anotherError = 'I am an error';

        apiModule.getAxios().interceptors.response.use(response => {
            if (response.data.code === 200) {
                return response.data.data;
            }
            else {
                return Promise.reject(response.data);
            }
        });

        apiModule.useCatch((context, next) => {
            expect(context.responseError).to.be.not.equal(null);
            context.setError(error);
            next(anotherError);
        });


        try {
            await apiModule.getInstance().test({ body: { code: 500, message: 'Internal server error' } });
            throw 'It should not go here';
        } catch (err) {
            expect(err).to.be.not.equal(error);
            expect(err).to.be.an('Error');
            expect(err).to.be.not.a('String');
            expect(err).to.be.match(new RegExp(anotherError));
        }
    });

    it('request was success, and fallback middleware will not be called', async () => {

        apiModule.useCatch((context, next) => {
            throw 'It should not go here';
            next();
        });

        try {
            const data = await apiModule.getInstance().test();
            expect(data).to.be.ok;
        } catch (err) {
            throw 'It should not go here';
        }
    });
});