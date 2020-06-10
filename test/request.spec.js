import chai, { expect } from 'chai';
import ApiModule from '../src';
import utils from './utils';


describe('request by baseConfig', () => {

    let config, apiModule, apiMapper;

    beforeEach('Setup ApiModule', () => {
        config = {
            baseURL: 'http://localhost:7788'
        };
        apiModule = new ApiModule({
            baseConfig: config,
            module: false,
            metadatas: {
                test: {
                    url: '/api/test',
                    method: 'post'
                }
            }
        });

        apiMapper = apiModule.getInstance();
    });

    it('axios should get be configured right', () => {
        const axios = apiModule.getAxios();
        expect(axios.defaults).to.have.contain(config);
    });

    it('server should get right data package', done => {
        const postData = {
            body: {
                a: 1,
                b: 2
            }
        };
        const server = utils.createServer(7788, req => {
            let rawData = '';
            req.on('data', chunk => rawData += chunk);
            req.on('end', () => {
                server.on('close', () => {
                    done();
                });
                server.close();
                const data = JSON.parse(rawData);
                expect(data).to.be.deep.equal(postData.body);
            });
        });
        server.on('listening', () => {
            apiMapper.test(postData);
        });
    });
});

describe('api metadata mapper', () => {

    beforeEach(() => {
        utils.overrideConsole();
    });

    afterEach(() => {
        utils.recoverConsole();
    });

    it('api request mapper set non-object options', () => {
        const apiModule = new ApiModule({
            module: false,
            metadatas: {
                test: {
                    url: '/test',
                    method: 'get'
                }
            }
        });

        expect(() => apiModule.getInstance().test(null, null)).to.throw(/the request parameter/);
    });
    it('test path parameter mode url', done => {
        const apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:7788'
            },
            module: false,
            metadatas: {
                test: {
                    url: '/api/{id}/:time/info',
                    method: 'post'
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        const id = 123;
        const time = Date.now();

        const server = utils.createServer(7788, req => {
            server.on('close', () => {
                done();
            });
            console.log(req.url);
            expect(req.url).to.be.equal(`/api/${id}/${time}/info?o=calvin&v=von`);
            server.close();
        });
        server.on('listening', () => {

            apiMapper.test({
                params: {
                    id,
                    time
                },
                query: {
                    o: 'calvin',
                    v: 'von'
                }
            });
        })
    });

    it('api request mapper options', done => {
        try {
            const apiModule = new ApiModule({
                baseConfig: {
                    baseURL: 'http://localhost:7788'
                },
                module: false,
                metadatas: {
                    test: {
                        url: '/api/info',
                        method: 'post'
                    }
                }
            });
            const apiMapper = apiModule.getInstance();

            const server = utils.createServer(7788, req => {
                let rawData = '';
                req.on('data', chunk => rawData += chunk);
                req.on('end', () => {
                    server.on('close', () => {
                        done();
                    });
                    expect(rawData).to.be.equal("{\"a\":1,\"b\":2}");
                    server.close();
                });
            });

            server.on('listening', () => {
                apiMapper.test({
                    body: {
                        a: 1,
                        b: 2
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    baseURL: 'http://localhost:7788'
                });
            });
        } catch (error) {
            console.log(error)
        }
    });
});

describe('cancellation', () => {
    let server;
    before('Setup server', done => {
        server = utils.createServer(7788);
        server.on('listening', done);
    });

    after('Stop and clean server', done => {
        server.on('close', () => {
            done();
        });
        server.close();
        server = null;
    });

    it('request cancellation', async () => {
        const apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:7788',
                timeout: 10000
            },
            module: false,
            metadatas: {
                test: {
                    url: '/api/info',
                    method: 'get'
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        const cancelSource = apiModule.generateCancellationSource();

        try {
            cancelSource.cancel('Canceled by the user');
            await apiMapper.test(
                null,
                {
                    cancelToken: cancelSource.token
                }
            );

        } catch (error) {
            expect(error.message).to.be.equal('Canceled by the user');
        }
    });
});